"""
PEATRA - Mathematical & Optimization Unit Tests
Verifies indicator formulas, normalization, constraints, and solver optimality.
"""

import os
import sys
import unittest
import pandas as pd
import numpy as np

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from modules.data_manager import load_sites, load_interventions
from modules.scoring import calculate_indicators, normalize_indicators, compute_weighted_score
from modules.optimization import solve_milp_highs, solve_greedy_baseline, validate_constraints

class TestPEATRAMathematics(unittest.TestCase):
    
    def setUp(self):
        self.sites_df = load_sites()
        self.interventions_df = load_interventions()
        
    def test_datasets_loaded(self):
        self.assertGreaterEqual(len(self.sites_df), 6)
        self.assertGreaterEqual(len(self.interventions_df), 18)
        
        # Verify 6 core sites exist with exact required conditions
        core_ids = ["A1", "A2", "B1", "B2", "C1", "C2"]
        for cid in core_ids:
            self.assertIn(cid, self.sites_df["site_id"].values)
            
        a1 = self.sites_df[self.sites_df["site_id"] == "A1"].iloc[0]
        self.assertEqual(a1["land_cover"], "Semak")
        self.assertEqual(a1["canal_condition"], "Rusak sebagian")
        self.assertAlmostEqual(float(a1["groundwater_depth"]), 0.78)
        self.assertAlmostEqual(float(a1["fire_risk_index"]), 70.0)

    def test_indicator_scoring_formulas(self):
        ind_df = calculate_indicators(self.sites_df, self.interventions_df, d_target=0.40)
        
        # Test site A1 repair
        a1_repair = ind_df[(ind_df["site_id"] == "A1") & (ind_df["action"] == "repair")].iloc[0]
        # Delta F = 28.0
        self.assertAlmostEqual(a1_repair["raw_delta_F"], 28.0)
        # D_i = 0.78 - 0.40 = 0.38 m. delta_h = 0.12 m. G_ia = min(0.12, 0.38) = 0.12 m
        self.assertAlmostEqual(a1_repair["raw_G"], 0.12)
        # V_ia = (65 / 100) * 80 = 52.0 ha-eq
        self.assertAlmostEqual(a1_repair["raw_V"], 52.0)
        
        # Test normalization
        norm_df = normalize_indicators(ind_df, method="fixed_ref")
        a1_norm = norm_df[(norm_df["site_id"] == "A1") & (norm_df["action"] == "repair")].iloc[0]
        # R = 100 * (28 / 40) = 70.0
        self.assertAlmostEqual(a1_norm["score_R"], 70.0)
        # W = 100 * (0.12 / 0.60) = 20.0
        self.assertAlmostEqual(a1_norm["score_W"], 20.0)
        # E = 100 * (52 / 200) = 26.0
        self.assertAlmostEqual(a1_norm["score_E"], 26.0)

    def test_milp_constraints_and_budget(self):
        ind_df = calculate_indicators(self.sites_df, self.interventions_df)
        norm_df = normalize_indicators(ind_df, method="fixed_ref")
        scored_df, (nw_R, nw_W, nw_E) = compute_weighted_score(norm_df, w_R=0.40, w_W=0.35, w_E=0.25)
        
        budget = 1_000_000_000 # 1 Miliar IDR
        res = solve_milp_highs(scored_df, budget=budget)
        
        # Validate constraints
        val = validate_constraints(res["df"], budget)
        self.assertTrue(val["budget_valid"], f"Budget exceeded: {val['total_cost']} > {budget}")
        self.assertTrue(val["uniqueness_valid"], "At most one action per site violated")
        self.assertTrue(val["feasibility_valid"], "Infeasible action selected")
        self.assertTrue(val["all_valid"])
        
        # B2 repair should NEVER be selected because technical_feasibility == 0
        b2_repair = res["df"][(res["df"]["site_id"] == "B2") & (res["df"]["action"] == "repair")]
        if not b2_repair.empty:
            self.assertEqual(int(b2_repair.iloc[0]["selected"]), 0)

    def test_greedy_vs_milp(self):
        ind_df = calculate_indicators(self.sites_df, self.interventions_df)
        norm_df = normalize_indicators(ind_df, method="fixed_ref")
        scored_df, _ = compute_weighted_score(norm_df, w_R=0.40, w_W=0.35, w_E=0.25)
        
        budget = 1_000_000_000
        milp_res = solve_milp_highs(scored_df, budget=budget)
        greedy_res = solve_greedy_baseline(scored_df, budget=budget)
        
        # MILP mathematically guarantees score >= Greedy score
        self.assertGreaterEqual(milp_res["total_score"], greedy_res["total_score"] - 1e-4)
        print(f"\n[Test Passed] MILP Score: {milp_res['total_score']} | Greedy Score: {greedy_res['total_score']}")
        print(f"[Test Passed] MILP Cost: Rp {milp_res['total_cost']:,.0f} | Budget: Rp {budget:,.0f}")

if __name__ == "__main__":
    unittest.main()
