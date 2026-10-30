"""
PEATRA - Monitoring & Feedback Module
Handles observation recording, validation checks, and audit logging.
"""

import pandas as pd
import datetime

def add_observation(monitoring_df, site_id, observation_date, groundwater_depth, canal_condition, fire_risk_index, hotspot_count, notes, validation_status="Menunggu Validasi"):
    """
    Appends a new field observation record.
    """
    new_id = f"OBS-{len(monitoring_df) + 1:03d}"
    new_record = {
        "observation_id": new_id,
        "site_id": site_id,
        "observation_date": str(observation_date),
        "groundwater_depth": float(groundwater_depth),
        "canal_condition": str(canal_condition),
        "fire_risk_index": float(fire_risk_index),
        "hotspot_count": int(hotspot_count),
        "validation_status": str(validation_status),
        "notes": str(notes)
    }
    
    updated_df = pd.concat([monitoring_df, pd.DataFrame([new_record])], ignore_index=True)
    return updated_df, new_id

def validate_observation_entry(monitoring_df, obs_id, new_status="Tervalidasi"):
    """
    Updates validation status of a specific observation.
    """
    df = monitoring_df.copy()
    mask = df["observation_id"] == obs_id
    if mask.any():
        df.loc[mask, "validation_status"] = new_status
    return df
