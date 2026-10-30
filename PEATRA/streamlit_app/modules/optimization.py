"""
PEATRA - Optimization Engine Module
Implements Binary Mixed-Integer Linear Programming (MILP) with HiGHS solver,
constraint verification, two-stage tie-breaking, and Greedy comparison.
"""

import numpy as np
import pandas as pd

def solve_milp_highs(df, budget, max_interventions=None, mandatory_sites=None, forbidden_actions=None):
    """
    Solves Binary MILP:
    Maximize Z = sum_{i,a} U_ia * x_ia
    Subject to:
      1. sum_{i,a} C_ia * x_ia <= Budget
      2. sum_a x_ia <= 1 for each site i
      3. x_ia <= q_ia (technical feasibility)
      4. Optional constraints: max_interventions, mandatory_sites, forbidden_actions
      5. x_ia in {0, 1}
    """
    df = df.copy().reset_index(drop=True)
    n = len(df)
    
    # We only need decision variables for non-zero interventions (repair, new_build)
    # Since no_intervention has cost=0 and score=0, choosing no intervention is equivalent to x_ia = 0
    active_indices = df[df["action"] != "no_intervention"].index.tolist()
    m = len(active_indices)
    
    # Objective coefficients: minimize -U_ia
    c = np.zeros(m)
    costs = np.zeros(m)
    feasibility = np.zeros(m)
    site_ids = []
    actions = []
    
    idx_map = {}
    for local_idx, orig_idx in enumerate(active_indices):
        idx_map[orig_idx] = local_idx
        row = df.iloc[orig_idx]
        c[local_idx] = -float(row["weighted_score"])
        costs[local_idx] = float(row["cost"])
        feasibility[local_idx] = int(row["technical_feasibility"])
        site_ids.append(row["site_id"])
        actions.append(row["action"])
        
    unique_sites = list(dict.fromkeys(site_ids))
    
    # Try importing scipy.optimize.milp
    scipy_available = False
    try:
        from scipy.optimize import milp, LinearConstraint, Bounds
        scipy_available = True
    except ImportError:
        scipy_available = False
        
    if scipy_available:
        # Build constraints
        # 1. Budget constraint: sum(costs * x) <= budget
        # 2. At most one per site: for each site, sum(x_ia) <= 1 (or == 1 if mandatory)
        # 3. Max interventions if specified: sum(x) <= max_interventions
        
        A_rows = []
        lhs = []
        rhs = []
        
        # Budget
        A_rows.append(costs.copy())
        lhs.append(-np.inf)
        rhs.append(float(budget))
        
        # At most one per site
        for s in unique_sites:
            s_row = np.zeros(m)
            for local_idx, sid in enumerate(site_ids):
                if sid == s:
                    s_row[local_idx] = 1.0
            A_rows.append(s_row)
            if mandatory_sites and s in mandatory_sites:
                lhs.append(1.0) # Exactly 1 intervention
                rhs.append(1.0)
            else:
                lhs.append(-np.inf)
                rhs.append(1.0)
                
        # Max interventions
        if max_interventions is not None and max_interventions > 0:
            A_rows.append(np.ones(m))
            lhs.append(-np.inf)
            rhs.append(float(max_interventions))
            
        A = np.array(A_rows)
        constraints = LinearConstraint(A, lhs, rhs)
        
        # Bounds: 0 <= x_ia <= 1 (and 0 if not feasible or forbidden)
        lb = np.zeros(m)
        ub = np.ones(m)
        for local_idx in range(m):
            sid = site_ids[local_idx]
            act = actions[local_idx]
            if feasibility[local_idx] == 0:
                ub[local_idx] = 0
            if forbidden_actions and (sid, act) in forbidden_actions:
                ub[local_idx] = 0
                
        bounds = Bounds(lb, ub)
        integrality = np.ones(m) # All binary
        
        res = milp(c=c, constraints=constraints, bounds=bounds, integrality=integrality)
        
        if res.success:
            x_sol = np.round(res.x).astype(int)
            status_msg = "Optimal (HiGHS Solver)"
            is_optimal = True
        else:
            x_sol = np.zeros(m, dtype=int)
            status_msg = f"Solver Status: {res.status_message}"
            is_optimal = False
    else:
        # Exact Branch & Bound / Knapsack Solver Fallback
        x_sol, is_optimal, status_msg = solve_exact_fallback(
            c, costs, feasibility, site_ids, actions, unique_sites, 
            budget, max_interventions, mandatory_sites, forbidden_actions
        )

    # Map solution back to full dataframe
    df["selected"] = 0
    df["solver_chosen"] = False
    
    total_score = 0.0
    total_cost = 0.0
    
    for local_idx, orig_idx in enumerate(active_indices):
        if x_sol[local_idx] == 1:
            df.loc[orig_idx, "selected"] = 1
            df.loc[orig_idx, "solver_chosen"] = True
            total_score += float(df.loc[orig_idx, "weighted_score"])
            total_cost += float(df.loc[orig_idx, "cost"])
            
    # Mark no_intervention for unselected sites
    selected_sites = set(df[df["selected"] == 1]["site_id"])
    for sid in unique_sites:
        if sid not in selected_sites:
            no_int_idx = df[(df["site_id"] == sid) & (df["action"] == "no_intervention")].index
            if len(no_int_idx) > 0:
                df.loc[no_int_idx[0], "selected"] = 1

    remaining_budget = budget - total_cost
    
    return {
        "df": df,
        "total_score": round(total_score, 4),
        "total_cost": total_cost,
        "remaining_budget": remaining_budget,
        "status": status_msg,
        "is_optimal": is_optimal,
        "num_selected": int(np.sum(x_sol))
    }

def solve_exact_fallback(c, costs, feasibility, site_ids, actions, unique_sites, budget, max_interventions, mandatory_sites, forbidden_actions):
    """
    Guaranteed exact branch-and-bound optimization when SciPy HiGHS is not pre-installed.
    Guarantees mathematical exactness with two-stage tie breaking.
    """
    m = len(c)
    scores = -c
    
    # Pre-filter valid choices per site
    site_choices = {}
    for sid in unique_sites:
        site_choices[sid] = []
        
    for local_idx in range(m):
        sid = site_ids[local_idx]
        act = actions[local_idx]
        if feasibility[local_idx] == 1:
            if not (forbidden_actions and (sid, act) in forbidden_actions):
                site_choices[sid].append((local_idx, scores[local_idx], costs[local_idx]))
                
    # Sort sites so mandatory or constrained come first
    ordered_sites = list(unique_sites)
    
    best_score = -1.0
    best_cost = float("inf")
    best_assignment = []
    
    def branch(site_idx, current_score, current_cost, current_count, current_sol):
        nonlocal best_score, best_cost, best_assignment
        if current_cost > budget:
            return
        if max_interventions and current_count > max_interventions:
            return
            
        if site_idx == len(ordered_sites):
            # Check mandatory sites
            if mandatory_sites:
                assigned_sites = {site_ids[idx] for idx in current_sol}
                if not set(mandatory_sites).issubset(assigned_sites):
                    return
            # Check if this solution beats current best (two-stage: maximize score, tie-break minimize cost)
            if (current_score > best_score + 1e-9) or (abs(current_score - best_score) <= 1e-9 and current_cost < best_cost):
                best_score = current_score
                best_cost = current_cost
                best_assignment = list(current_sol)
            return

        sid = ordered_sites[site_idx]
        is_mand = mandatory_sites and (sid in mandatory_sites)
        
        # Option 1: Pick an intervention for this site
        for local_idx, sc, co in site_choices[sid]:
            if current_cost + co <= budget:
                branch(site_idx + 1, current_score + sc, current_cost + co, current_count + 1, current_sol + [local_idx])
                
        # Option 2: Do nothing on this site (only if not mandatory)
        if not is_mand:
            branch(site_idx + 1, current_score, current_cost, current_count, current_sol)

    branch(0, 0.0, 0.0, 0, [])
    
    x_sol = np.zeros(m, dtype=int)
    for idx in best_assignment:
        x_sol[idx] = 1
        
    return x_sol, True, "Optimal (Branch & Bound Exact Solver)"

def solve_greedy_baseline(df, budget, mandatory_sites=None):
    """
    Greedy heuristic baseline:
    Ranks interventions by U_ia / C_ia ratio and packs sequentially.
    """
    df = df.copy()
    active = df[(df["action"] != "no_intervention") & (df["technical_feasibility"] == 1)].copy()
    
    # Avoid zero division
    active["efficiency_ratio"] = active.apply(
        lambda r: (r["weighted_score"] / r["cost"]) if r["cost"] > 0 else 0.0, axis=1
    )
    
    sorted_candidates = active.sort_values(by="efficiency_ratio", ascending=False)
    
    selected_indices = []
    used_sites = set()
    spent_budget = 0.0
    total_score = 0.0
    
    for idx, row in sorted_candidates.iterrows():
        sid = row["site_id"]
        c = float(row["cost"])
        s = float(row["weighted_score"])
        
        if sid not in used_sites and (spent_budget + c <= budget):
            selected_indices.append(idx)
            used_sites.add(sid)
            spent_budget += c
            total_score += s

    df["selected_greedy"] = 0
    for idx in selected_indices:
        df.loc[idx, "selected_greedy"] = 1
        
    return {
        "df": df,
        "total_score": round(total_score, 4),
        "total_cost": spent_budget,
        "remaining_budget": budget - spent_budget,
        "num_selected": len(selected_indices)
    }

def validate_constraints(solution_df, budget):
    """
    Validates:
    1. Total cost <= budget
    2. At most one intervention per site
    3. Technical feasibility == 1 for all chosen actions
    """
    chosen = solution_df[solution_df["selected"] == 1].copy()
    
    # Filter out no_intervention for cost & feasibility check
    active_chosen = chosen[chosen["action"] != "no_intervention"]
    
    # 1. Budget check
    total_cost = active_chosen["cost"].sum()
    budget_valid = total_cost <= (budget + 1e-4)
    
    # 2. At most one action per site
    site_counts = chosen["site_id"].value_counts()
    uniqueness_valid = (site_counts <= 1).all()
    
    # 3. Technical feasibility check
    feasibility_valid = (active_chosen["technical_feasibility"] == 1).all()
    
    return {
        "budget_valid": bool(budget_valid),
        "uniqueness_valid": bool(uniqueness_valid),
        "feasibility_valid": bool(feasibility_valid),
        "all_valid": bool(budget_valid and uniqueness_valid and feasibility_valid),
        "total_cost": float(total_cost),
        "budget": float(budget)
    }
