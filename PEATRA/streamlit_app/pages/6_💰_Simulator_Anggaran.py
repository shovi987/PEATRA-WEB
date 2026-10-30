"""
PEATRA — Budget Simulator (Simulator Anggaran)
Matches Screen 5 in UI Reference.
Allows dynamic budget adjustment with instant re-optimization,
portfolio metrics, and budget sensitivity curve.
"""

import streamlit as st
import pandas as pd
import numpy as np
from modules.data_manager import load_sites, load_interventions, load_monitoring, apply_validated_monitoring
from modules.scoring import calculate_indicators, normalize_indicators, compute_weighted_score
from modules.optimization import solve_milp_highs, solve_greedy_baseline
from modules.sensitivity import run_budget_sensitivity
from modules.visualizations import plot_budget_sensitivity_curve

st.set_page_config(page_title="Simulator Anggaran — PEATRA", page_icon="💰", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .peatra-header { background: #FFFFFF; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px; }
    .budget-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="peatra-header">
    <div style="font-size:22px; font-weight:800; color:#213A75;">Simulator Anggaran Restorasi (Budget Simulator)</div>
    <div style="font-size:13px; color:#64748B;">Uji sensitivitas alokasi dana terhadap efektivitas dan jangkauan restorasi lahan gambut.</div>
</div>
""", unsafe_allow_html=True)

if "sites_df" not in st.session_state:
    st.session_state["sites_df"] = load_sites()
if "interventions_df" not in st.session_state:
    st.session_state["interventions_df"] = load_interventions()
if "monitoring_df" not in st.session_state:
    st.session_state["monitoring_df"] = load_monitoring()

sites = apply_validated_monitoring(st.session_state["sites_df"], st.session_state["monitoring_df"])
interventions = st.session_state["interventions_df"]

col_left, col_mid, col_right = st.columns([4, 4, 4])

with col_left:
    st.subheader("Atur Anggaran")
    
    # Preset buttons
    preset_cols = st.columns(3)
    preset_val = None
    with preset_cols[0]:
        if st.button("Rp 500 Juta"):
            preset_val = 500_000_000
    with preset_cols[1]:
        if st.button("Rp 1 Miliar"):
            preset_val = 1_000_000_000
    with preset_cols[2]:
        if st.button("Rp 2 Miliar"):
            preset_val = 2_000_000_000
            
    current_val = preset_val if preset_val is not None else int(st.session_state.get("budget", 1_000_000_000))
    
    sim_budget = st.slider(
        "Geser Nilai Anggaran:",
        min_value=200_000_000,
        max_value=3_000_000_000,
        value=current_val,
        step=50_000_000,
        format="Rp %d"
    )
    st.session_state["budget"] = sim_budget
    st.markdown(f"**Anggaran Simulasi:** Rp {sim_budget:,.0f}")

# Re-run scoring & optimization
ind_df = calculate_indicators(sites, interventions)
norm_df = normalize_indicators(ind_df, method="fixed_ref")
scored_df, _ = compute_weighted_score(norm_df, w_R=0.40, w_W=0.35, w_E=0.25)

milp_res = solve_milp_highs(scored_df, budget=sim_budget)
chosen = milp_res["df"][milp_res["df"]["selected"] == 1]
active_chosen = chosen[chosen["action"] != "no_intervention"]

num_repair = len(active_chosen[active_chosen["action"] == "repair"])
num_new = len(active_chosen[active_chosen["action"] == "new_build"])
total_sel = len(active_chosen)
avg_wetting = (active_chosen["hydrological_improvement"].mean() * 100) if total_sel > 0 else 0

with col_mid:
    st.subheader("Ringkasan Hasil")
    st.markdown(f"""
    <div class="budget-card">
        <div style="font-size:12px; color:#64748B; font-weight:600;">JUMLAH LOKASI TERPILIH</div>
        <div style="font-size:32px; font-weight:800; color:#213A75; margin:6px 0;">{total_sel} Lokasi</div>
        <div class="stat-row">
            <span>🔧 Perbaikan Sekat Lama:</span>
            <strong>{num_repair} ({num_repair/total_sel*100:.0f}% if total_sel > 0 else 0)</strong>
        </div>
        <div class="stat-row">
            <span>🏗️ Pembangunan Sekat Baru:</span>
            <strong>{num_new} ({num_new/total_sel*100:.0f}% if total_sel > 0 else 0)</strong>
        </div>
        <div class="stat-row">
            <span>💧 Estimasi Kenaikan TMA:</span>
            <strong style="color:#0D9488;">+{avg_wetting:.1f} cm (rata-rata)</strong>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col_right:
    st.subheader("Pemanfaatan Anggaran")
    used_pct = (milp_res['total_cost'] / sim_budget) * 100 if sim_budget > 0 else 0
    st.markdown(f"""
    <div class="budget-card">
        <div class="stat-row">
            <span style="color:#64748B;">Total Anggaran:</span>
            <strong>Rp {sim_budget:,.0f}</strong>
        </div>
        <div class="stat-row">
            <span style="color:#64748B;">Anggaran Terpakai:</span>
            <strong style="color:#213A75;">Rp {milp_res['total_cost']:,.0f}</strong>
        </div>
        <div class="stat-row">
            <span style="color:#64748B;">Sisa Anggaran:</span>
            <strong style="color:#16A34A;">Rp {milp_res['remaining_budget']:,.0f}</strong>
        </div>
        <div style="margin-top:14px;">
            <div style="font-size:12px; margin-bottom:4px; font-weight:600; color:#64748B;">Efisiensi Penyerapan: {used_pct:.1f}%</div>
            <div style="background:#E2E8F0; border-radius:6px; height:10px; width:100%; overflow:hidden;">
                <div style="background:#2F698B; width:{used_pct}%; height:100%;"></div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

st.divider()

# Sensitivity Curve Section
st.subheader("📈 Kurva Sensitivitas Anggaran vs Total Manfaat Portofolio")
steps = [200e6, 400e6, 600e6, 800e6, 1e9, 1.2e9, 1.5e9, 2e9, 2.5e9, 3e9]
sens_df = run_budget_sensitivity(sites, interventions, steps)
fig_curve = plot_budget_sensitivity_curve(sens_df)
st.plotly_chart(fig_curve, use_container_width=True)

st.caption("Kurva memperlihatkan diminishing returns (manfaat marjinal yang menurun) seiring bertambahnya anggaran setelah lokasi-lokasi paling kritis berhasil ditangani.")
