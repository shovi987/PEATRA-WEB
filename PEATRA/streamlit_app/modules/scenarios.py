"""
PEATRA - Environmental Scenario Simulator Module
Simulates Normal, Dry Season, and Elevated Fire Risk conditions.
"""

import numpy as np
import pandas as pd

def apply_environmental_scenario(sites_df, interventions_df, scenario_name="Normal"):
    """
    Applies scenario modifications:
    - 'Normal': baseline values
    - 'Dry Season' / 'Musim Kering':
        * groundwater depth drops: +0.10m (Baik), +0.20m (Rusak sebagian), +0.30m (Rusak berat / Tidak ada)
        * fire risk index * 1.25 (max 100)
        * canal block effectiveness * 1.30
    - 'Elevated Fire Risk' / 'Risiko Kebakaran Tinggi':
        * fire risk index increases by land cover multiplier:
            Bekas terbakar: 1.40, Semak: 1.30, Kebun campuran: 1.15, Hutan sekunder: 1.05
    """
    s_df = sites_df.copy()
    i_df = interventions_df.copy()
    
    if scenario_name in ["Dry Season", "Musim Kering"]:
        # 1. Groundwater drop
        def get_gw_drop(cond):
            if cond == "Baik":
                return 0.10
            elif cond == "Rusak sebagian":
                return 0.20
            else:
                return 0.30
                
        drops = s_df["canal_condition"].apply(get_gw_drop)
        s_df["groundwater_depth"] = np.round(s_df["groundwater_depth"] + drops, 2)
        
        # 2. Fire risk * 1.25
        s_df["fire_risk_index"] = np.clip(np.round(s_df["fire_risk_index"] * 1.25, 1), 0, 100)
        
        # 3. Interventions effectiveness * 1.30 for wetting, * 1.25 for fire reduction
        i_df["hydrological_improvement"] = np.round(i_df["hydrological_improvement"] * 1.30, 3)
        i_df["delta_fire_risk"] = np.clip(np.round(i_df["delta_fire_risk"] * 1.25, 1), 0, 100)
        
    elif scenario_name in ["Elevated Fire Risk", "Risiko Kebakaran Tinggi"]:
        # Multiplier based on land cover
        multipliers = {
            "Bekas terbakar": 1.40,
            "Semak": 1.30,
            "Kebun campuran": 1.15,
            "Hutan sekunder": 1.05
        }
        
        factors = s_df["land_cover"].map(multipliers).fillna(1.20)
        s_df["fire_risk_index"] = np.clip(np.round(s_df["fire_risk_index"] * factors, 1), 0, 100)
        
        # In severe fire season, fire risk reduction from canal blocks is even more valuable (+20%)
        i_df["delta_fire_risk"] = np.clip(np.round(i_df["delta_fire_risk"] * 1.20, 1), 0, 100)
        
    return s_df, i_df
