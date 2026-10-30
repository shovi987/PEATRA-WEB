"""
PEATRA - Data Manager Module
Handles loading, caching, resetting, and updating active datasets.
"""

import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def get_data_dir():
    return DATA_DIR

def load_sites(filepath=None):
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "sites.csv")
    df = pd.read_csv(filepath)
    return df

def load_interventions(filepath=None):
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "interventions.csv")
    df = pd.read_csv(filepath)
    return df

def load_monitoring(filepath=None):
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "monitoring.csv")
    df = pd.read_csv(filepath)
    return df

def apply_validated_monitoring(sites_df, monitoring_df):
    """
    Applies validated monitoring records to update active site indicators.
    - groundwater_depth -> updates d_i
    - canal_condition -> updates feasibility
    - fire_risk_index -> updates F_i
    Only observations with validation_status == 'Tervalidasi' are applied.
    """
    updated_sites = sites_df.copy()
    validated = monitoring_df[monitoring_df["validation_status"] == "Tervalidasi"].copy()
    
    if validated.empty:
        return updated_sites

    # Sort by observation_date ascending so latest observation takes precedence
    validated["observation_date"] = pd.to_datetime(validated["observation_date"])
    validated = validated.sort_values(by="observation_date")

    for _, row in validated.iterrows():
        sid = row["site_id"]
        mask = updated_sites["site_id"] == sid
        if mask.any():
            if pd.notnull(row["groundwater_depth"]):
                updated_sites.loc[mask, "groundwater_depth"] = float(row["groundwater_depth"])
            if pd.notnull(row["canal_condition"]):
                updated_sites.loc[mask, "canal_condition"] = str(row["canal_condition"])
            if pd.notnull(row["fire_risk_index"]):
                updated_sites.loc[mask, "fire_risk_index"] = float(row["fire_risk_index"])
                
    return updated_sites
