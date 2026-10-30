"""
PEATRA — Peatland Assessment (Penilaian Gambut)
Systematic multi-attribute assessment of peatland site condition, risk, and priority.
"""

import streamlit as st
import pandas as pd
from modules.data_manager import load_sites, load_monitoring, apply_validated_monitoring

st.set_page_config(page_title="Penilaian Gambut — PEATRA", page_icon="📋", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .peatra-header { background: #FFFFFF; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px; }
    .peatra-title { font-size: 22px; font-weight: 800; color: #213A75; }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="peatra-header">
    <div class="peatra-title">Penilaian Multi-Atribut Lahan Gambut (Peatland Assessment)</div>
    <div style="font-size:13px; color:#64748B;">Evaluasi komprehensif tutupan lahan, elevasi muka air tanah, risiko kebakaran, dan sensitivitas ekologis.</div>
</div>
""", unsafe_allow_html=True)

if "sites_df" not in st.session_state:
    st.session_state["sites_df"] = load_sites()
if "monitoring_df" not in st.session_state:
    st.session_state["monitoring_df"] = load_monitoring()

sites = apply_validated_monitoring(st.session_state["sites_df"], st.session_state["monitoring_df"])

# Add composite risk tier
def classify_priority(row):
    gw = row["groundwater_depth"]
    fire = row["fire_risk_index"]
    if gw >= 0.75 or fire >= 75:
        return "Prioritas Tinggi (Kritis)"
    elif gw >= 0.50 or fire >= 50:
        return "Prioritas Sedang"
    else:
        return "Prioritas Rendah (Terkontrol)"

sites["Tingkat Prioritas"] = sites.apply(classify_priority, axis=1)

# Filters
c1, c2, c3 = st.columns(3)
with c1:
    search_q = st.text_input("🔍 Cari Lokasi / Kode:", "")
with c2:
    priority_f = st.multiselect("Filter Prioritas:", sites["Tingkat Prioritas"].unique(), default=sites["Tingkat Prioritas"].unique())
with c3:
    cond_f = st.multiselect("Kondisi Sekat:", sites["canal_condition"].unique(), default=sites["canal_condition"].unique())

filtered = sites[
    (sites["Tingkat Prioritas"].isin(priority_f)) &
    (sites["canal_condition"].isin(cond_f)) &
    (sites["site_name"].str.contains(search_q, case=False) | sites["site_id"].str.contains(search_q, case=False))
]

st.dataframe(
    filtered[[
        "site_id", "site_name", "land_cover", "canal_condition", 
        "groundwater_depth", "fire_risk_index", "ecological_sensitivity", 
        "affected_area", "accessibility", "Tingkat Prioritas"
    ]],
    column_config={
        "site_id": "Kode",
        "site_name": "Nama Lokasi",
        "land_cover": "Tutupan Lahan",
        "canal_condition": "Sekat Eksisting",
        "groundwater_depth": st.column_config.NumberColumn("Kedalaman Muka Air (m)", format="%.2f m"),
        "fire_risk_index": st.column_config.ProgressColumn("Indeks Risiko Api", min_value=0, max_value=100, format="%.1f"),
        "ecological_sensitivity": st.column_config.NumberColumn("Sensitivitas Ekologis", format="%.0f"),
        "affected_area": st.column_config.NumberColumn("Luas (ha)", format="%.0f ha"),
        "accessibility": "Akses",
        "Tingkat Prioritas": "Klasifikasi"
    },
    use_container_width=True,
    hide_index=True
)

st.caption("Ambang batas kepatuhan muka air tanah mengacu pada PP No. 57/2016 jo. PP No. 71/2014 sebesar 0,40 meter dari permukaan tanah.")
