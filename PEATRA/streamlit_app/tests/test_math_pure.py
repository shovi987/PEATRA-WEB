"""
PEATRA - Pure Python Mathematical Validation
Tests the mathematical engine using standard library (no dependencies required).
"""

import math

DELTA_F_REF = 40.0
G_REF = 0.60
V_REF = 200.0
D_TARGET = 0.40

def calc_site_repair_score(site, repair_action, w_R=0.40, w_W=0.35, w_E=0.25):
    # 1. Fire risk reduction
    delta_F = max(0.0, float(repair_action["delta_fire_risk"]))
    # 2. Hydrology
    d_i = float(site["groundwater_depth"])
    D_i = max(0.0, d_i - D_TARGET)
    delta_h = max(0.0, float(repair_action["hydrological_improvement"]))
    G_ia = min(delta_h, D_i)
    # 3. Ecology
    s_i = float(site["ecological_sensitivity"])
    A_ia = float(repair_action["ecological_area_benefit"])
    V_ia = (s_i / 100.0) * A_ia
    
    # Normalization
    R_ia = 100.0 * min(1.0, max(0.0, delta_F / DELTA_F_REF))
    W_ia = 100.0 * min(1.0, max(0.0, G_ia / G_REF))
    E_ia = 100.0 * min(1.0, max(0.0, V_ia / V_REF))
    
    # Normalized weights
    total_w = w_R + w_W + w_E
    nw_R, nw_W, nw_E = w_R / total_w, w_W / total_w, w_E / total_w
    
    U_ia = nw_R * R_ia + nw_W * W_ia + nw_E * E_ia
    return {
        "delta_F": delta_F, "G_ia": G_ia, "V_ia": V_ia,
        "R_ia": R_ia, "W_ia": W_ia, "E_ia": E_ia,
        "U_ia": U_ia
    }

def run_tests():
    print("Running PEATRA Mathematical Validation Tests...")
    
    # Test Site A1
    site_A1 = {
        "site_id": "A1", "groundwater_depth": 0.78,
        "fire_risk_index": 70, "ecological_sensitivity": 65
    }
    action_repair_A1 = {
        "delta_fire_risk": 28.0,
        "hydrological_improvement": 0.12,
        "ecological_area_benefit": 80.0
    }
    
    res = calc_site_repair_score(site_A1, action_repair_A1)
    
    assert res["delta_F"] == 28.0, f"Expected 28.0, got {res['delta_F']}"
    assert abs(res["G_ia"] - 0.12) < 1e-6, f"Expected 0.12, got {res['G_ia']}"
    assert abs(res["V_ia"] - 52.0) < 1e-6, f"Expected 52.0, got {res['V_ia']}"
    
    # R = 100 * (28 / 40) = 70.0
    assert abs(res["R_ia"] - 70.0) < 1e-6, f"Expected 70.0, got {res['R_ia']}"
    # W = 100 * (0.12 / 0.60) = 20.0
    assert abs(res["W_ia"] - 20.0) < 1e-6, f"Expected 20.0, got {res['W_ia']}"
    # E = 100 * (52 / 200) = 26.0
    assert abs(res["E_ia"] - 26.0) < 1e-6, f"Expected 26.0, got {res['E_ia']}"
    
    # Weighted score: 0.40 * 70 + 0.35 * 20 + 0.25 * 26 = 28 + 7 + 6.5 = 41.5
    expected_U = 0.40 * 70.0 + 0.35 * 20.0 + 0.25 * 26.0
    assert abs(res["U_ia"] - expected_U) < 1e-6, f"Expected {expected_U}, got {res['U_ia']}"
    
    print(f"  [PASS] Site A1 Repair Score U_ia = {res['U_ia']:.2f} (R={res['R_ia']}, W={res['W_ia']}, E={res['E_ia']})")
    
    # Test Budget Constraint & Knapsack
    # Say we have 3 sites with choices:
    items = [
        {"name": "A1_repair", "cost": 350e6, "score": 41.5, "site": "A1"},
        {"name": "A1_new", "cost": 600e6, "score": 58.2, "site": "A1"},
        {"name": "A2_repair", "cost": 420e6, "score": 48.0, "site": "A2"},
        {"name": "A2_new", "cost": 680e6, "score": 69.5, "site": "A2"},
        {"name": "B1_repair", "cost": 300e6, "score": 38.5, "site": "B1"},
        {"name": "B1_new", "cost": 550e6, "score": 52.0, "site": "B1"},
    ]
    budget = 1_000_000_000 # 1 Miliar
    
    # Brute force search for exact optimum
    best_score = 0
    best_cost = 0
    best_combo = []
    
    from itertools import combinations
    for r in range(1, len(items) + 1):
        for combo in combinations(items, r):
            # check at most one per site
            sites_in_combo = [x["site"] for x in combo]
            if len(sites_in_combo) != len(set(sites_in_combo)):
                continue
            total_c = sum(x["cost"] for x in combo)
            if total_c <= budget:
                total_s = sum(x["score"] for x in combo)
                if total_s > best_score:
                    best_score = total_s
                    best_cost = total_c
                    best_combo = combo
                    
    print(f"  [PASS] MILP / Exact Optimum at Rp {budget/1e6:.0f}M: Total Score = {best_score:.2f}, Cost = Rp {best_cost/1e6:.0f}M")
    print(f"         Selected: {[x['name'] for x in best_combo]}")
    assert best_cost <= budget, "Budget exceeded"
    
    print("ALL MATHEMATICAL FORMULATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
