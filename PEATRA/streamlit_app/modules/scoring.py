"""
PEATRA - Multi-Criteria Scoring Module
Implements indicator calculations, normalization, and weighted scoring.
"""

import numpy as np
import pandas as pd

DELTA_F_REF = 40.0    # 40 poin penurunan indeks kebakaran
G_REF = 0.60          # 0.60 meter perbaikan hidrologis
V_REF = 200.0         # 200 ha habitat ekuivalen
DEFAULT_D_TARGET = 0.40 # Target muka air PP No. 57/2016

def calculate_indicators(sites_df, interventions_df, d_target=DEFAULT_D_TARGET):
    """
    Computes raw indicators for each site-action pair:
    - Delta F_ia: Fire risk reduction
    - G_ia: Hydrological improvement
    - V_ia: Ecological benefit
    """
    # Merge sites with interventions on site_id
    merged = pd.merge(interventions_df, sites_df, on="site_id", suffixes=("_action", "_site"))
    
    # 1. Fire risk reduction: Delta F_ia
    delta_F = np.maximum(0.0, merged["delta_fire_risk"].astype(float))
    
    # 2. Hydrological improvement:
    # D_i = max(0, d_i - d_target)
    # G_ia = min(max(0, delta_h_ia), D_i)
    d_i = merged["groundwater_depth"].astype(float)
    D_i = np.maximum(0.0, d_i - d_target)
    delta_h = np.maximum(0.0, merged["hydrological_improvement"].astype(float))
    G_ia = np.minimum(delta_h, D_i)
    
    # 3. Ecological benefit:
    # V_ia = (s_i / 100) * A_ia
    s_i = merged["ecological_sensitivity"].astype(float)
    A_ia = merged["ecological_area_benefit"].astype(float)
    V_ia = (s_i / 100.0) * A_ia
    
    merged["raw_delta_F"] = delta_F
    merged["raw_G"] = G_ia
    merged["raw_V"] = V_ia
    
    return merged

def normalize_indicators(df, method="fixed_ref", delta_f_ref=DELTA_F_REF, g_ref=G_REF, v_ref=V_REF):
    """
    Normalizes indicators to [0, 100] using specified method:
    - 'fixed_ref': Fixed reference scale (Default & recommended)
    - 'linear_max': Linear maximum (SAW)
    - 'min_max': Min-Max normalization
    """
    df = df.copy()
    
    if method == "fixed_ref":
        df["score_R"] = 100.0 * np.clip(df["raw_delta_F"] / delta_f_ref, 0.0, 1.0)
        df["score_W"] = 100.0 * np.clip(df["raw_G"] / g_ref, 0.0, 1.0)
        df["score_E"] = 100.0 * np.clip(df["raw_V"] / v_ref, 0.0, 1.0)
    elif method == "linear_max":
        max_F = df["raw_delta_F"].max()
        max_G = df["raw_G"].max()
        max_V = df["raw_V"].max()
        
        df["score_R"] = 100.0 * (df["raw_delta_F"] / max_F) if max_F > 0 else 0.0
        df["score_W"] = 100.0 * (df["raw_G"] / max_G) if max_G > 0 else 0.0
        df["score_E"] = 100.0 * (df["raw_V"] / max_V) if max_V > 0 else 0.0
    elif method == "min_max":
        for col, target in [("raw_delta_F", "score_R"), ("raw_G", "score_W"), ("raw_V", "score_E")]:
            min_v = df[col].min()
            max_v = df[col].max()
            if max_v > min_v:
                df[target] = 100.0 * (df[col] - min_v) / (max_v - min_v)
            else:
                df[target] = 0.0
    else:
        raise ValueError(f"Unknown normalization method: {method}")
        
    return df

def compute_weighted_score(df, w_R=0.40, w_W=0.35, w_E=0.25):
    """
    Calculates U_ia = w_R * R_ia + w_W * W_ia + w_E * E_ia
    Normalizes weights so sum equals 1.0.
    """
    total_w = w_R + w_W + w_E
    if total_w <= 0:
        w_R, w_W, w_E = 0.40, 0.35, 0.25
        total_w = 1.0
    
    nw_R = w_R / total_w
    nw_W = w_W / total_w
    nw_E = w_E / total_w
    
    df = df.copy()
    df["weighted_score"] = (nw_R * df["score_R"]) + (nw_W * df["score_W"]) + (nw_E * df["score_E"])
    
    # Force score to 0 if action is not technically feasible or is no_intervention
    df.loc[df["technical_feasibility"] == 0, "weighted_score"] = 0.0
    df.loc[df["action"] == "no_intervention", "weighted_score"] = 0.0
    
    return df, (nw_R, nw_W, nw_E)
