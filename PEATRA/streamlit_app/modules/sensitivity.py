"""
PEATRA - Sensitivity Analysis & Monte Carlo Module
Generates budget sensitivity curves, cost perturbation bounds,
Monte Carlo decision stability, and minimax regret matrices.
"""

import numpy as np
import pandas as pd
from .scoring import calculate_indicators, normalize_indicators, compute_weighted_score
from .optimization import solve_milp_highs, solve_greedy_baseline

def run_budget_sensitivity(sites_df, interventions_df, budget_steps, w_R=0.40, w_W=0.35, w_E=0.25):
    """
    Computes optimal portfolio and greedy baseline across a range of budget steps.
    """
    results = []
    
    ind_df = calculate_indicators(sites_df, interventions_df)
    norm_df = normalize_indicators(ind_df, method="fixed_ref")
    scored_df, _ = compute_weighted_score(norm_df, w_R, w_W, w_E)
    
    for b in budget_steps:
        milp_res = solve_milp_highs(scored_df, budget=b)
        greedy_res = solve_greedy_baseline(scored_df, budget=b)
        
        milp_score = milp_res["total_score"]
        greedy_score = greedy_res["total_score"]
        
        rel_diff = ((milp_score - greedy_score) / greedy_score * 100.0) if greedy_score > 0 else 0.0
        
        results.append({
            "budget": b,
            "milp_score": milp_score,
            "milp_cost": milp_res["total_cost"],
            "milp_sites": milp_res["num_selected"],
            "greedy_score": greedy_score,
            "greedy_cost": greedy_res["total_cost"],
            "greedy_sites": greedy_res["num_selected"],
            "improvement_pct": round(rel_diff, 2)
        })
        
    return pd.DataFrame(results)

def run_monte_carlo(sites_df, interventions_df, budget, n_iterations=100, w_R=0.40, w_W=0.35, w_E=0.25):
    """
    Simulates decision stability under data uncertainty (costs +/-15%, benefits +/-20%).
    Tracks selection frequency for each site-action pair.
    """
    np.random.seed(42)
    selection_counts = {}
    
    for i in range(n_iterations):
        perturbed_interventions = interventions_df.copy()
        
        # Perturb cost: log-normal or normal with std 0.10
        cost_factors = np.random.uniform(0.85, 1.15, size=len(perturbed_interventions))
        perturbed_interventions["cost"] = perturbed_interventions["cost"] * cost_factors
        
        # Perturb benefits: uniform +/- 20%
        benefit_factors = np.random.uniform(0.80, 1.20, size=len(perturbed_interventions))
        perturbed_interventions["delta_fire_risk"] = perturbed_interventions["delta_fire_risk"] * benefit_factors
        perturbed_interventions["hydrological_improvement"] = perturbed_interventions["hydrological_improvement"] * benefit_factors
        
        ind_df = calculate_indicators(sites_df, perturbed_interventions)
        norm_df = normalize_indicators(ind_df, method="fixed_ref")
        scored_df, _ = compute_weighted_score(norm_df, w_R, w_W, w_E)
        
        res = solve_milp_highs(scored_df, budget=budget)
        chosen = res["df"][res["df"]["selected"] == 1]
        
        for _, row in chosen.iterrows():
            key = (row["site_id"], row["action"])
            selection_counts[key] = selection_counts.get(key, 0) + 1
            
    summary = []
    for (sid, act), count in selection_counts.items():
        summary.append({
            "site_id": sid,
            "action": act,
            "selection_frequency": count,
            "selection_pct": round(count / n_iterations * 100.0, 1)
        })
        
    return pd.DataFrame(summary).sort_values(by="selection_pct", ascending=False)
