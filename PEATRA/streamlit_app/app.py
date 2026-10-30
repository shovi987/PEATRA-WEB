"""
PEATRA — Adaptive Multi-Objective Peatland Restoration Optimizer
Main Entry Point & Dashboard (Streamlit)
Pilot Location: Kabupaten Pelalawan, Provinsi Riau (KHG Sungai Kampar - Gaung)
"""

import streamlit as st
import pandas as pd
import numpy as np
import os
import sys

# Page Configuration
st.set_page_config(
    page_title="PEATRA — Peatland Restoration Optimizer",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling to enforce official PEATRA palette
st.markdown("""
<style>
    :root {
        --peatra-green-light: #84E488;
        --peatra-green-main: #6BCE90;
        --peatra-teal-light: #54B79A;
        --peatra-teal-main: #409DA1;
        --peatra-blue-main: #2F698B;
        --peatra-navy-main: #213A75;
        --peatra-bg-main: #F7FAF8;
    }
    
    .stApp {
        background-color: #F7FAF8;
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    /* Sidebar */
    [data-testid="stSidebar"] {
        background-color: #FFFFFF;
        border-right: 1px solid #E2E8F0;
    }
    
    /* Topbar */
    .peatra-header {
        background: #FFFFFF;
        padding: 16px 24px;
        border-radius: 12px;
        border: 1px solid #E2E8F0;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .peatra-title {
        font-size: 24px;
        font-weight: 800;
        color: #213A75;
        letter-spacing: -0.02em;
        margin: 0;
    }
    
    .peatra-subtitle {
        font-size: 13px;
        color: #64748B;
        margin-top: 4px;
    }
    
    .peatra-tagline {
        font-size: 13px;
        font-weight: 600;
        color: #409DA1;
    }
    
    /* KPI Cards */
    .kpi-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
    }
    
    .kpi-card {
        background: #FFFFFF;
        padding: 18px 20px;
        border-radius: 12px;
        border: 1px solid #E2E8F0;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    
    .kpi-label {
        font-size: 12px;
        color: #64748B;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .kpi-value {
        font-size: 26px;
        font-weight: 700;
        color: #213A75;
        margin-top: 6px;
    }
    
    .kpi-subtext {
        font-size: 12px;
        color: #54B79A;
        font-weight: 500;
        margin-top: 4px;
    }
    
    /* Alert Banner */
    .banner-illustrative {
        background: #F0FDF4;
        border: 1px solid #BBF7D0;
        color: #166534;
        padding: 10px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Import local modules
from modules.data_manager import load_sites, load_interventions, load_monitoring, apply_validated_monitoring
from modules.scoring import calculate_indicators, normalize_indicators, compute_weighted_score
from modules.optimization import solve_milp_highs, solve_greedy_baseline
from modules.visualizations import plot_intervention_distribution

# Initialize Session State
if "sites_df" not in st.session_state:
    st.session_state["sites_df"] = load_sites()
if "interventions_df" not in st.session_state:
    st.session_state["interventions_df"] = load_interventions()
if "monitoring_df" not in st.session_state:
    st.session_state["monitoring_df"] = load_monitoring()
if "budget" not in st.session_state:
    st.session_state["budget"] = 1_000_000_000 # Rp 1 Miliar
if "w_R" not in st.session_state:
    st.session_state["w_R"] = 0.40
if "w_W" not in st.session_state:
    st.session_state["w_W"] = 0.35
if "w_E" not in st.session_state:
    st.session_state["w_E"] = 0.25

# Sidebar Branding
with st.sidebar:
    st.markdown("""
    <div style='display:flex; align-items:center; gap:10px; margin-bottom:12px;'>
        <div style='background:#84E488; width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:20px;'>🌿</div>
        <div>
            <div style='font-size:18px; font-weight:800; color:#213A75; line-height:1.1;'>PEATRA</div>
            <div style='font-size:10px; color:#409DA1; font-weight:600;'>Adaptive Peatland Optimizer</div>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.caption("Wilayah Pilot: KHG Sungai Kampar - Gaung, Kab. Pelalawan, Riau")
    st.divider()
    
    st.subheader("⚙️ Parameter Global")
    budget_input = st.number_input(
        "Batas Anggaran (IDR)", 
        min_value=100_000_000, 
        max_value=5_000_000_000, 
        value=int(st.session_state["budget"]),
        step=50_000_000,
        format="%d"
    )
    st.session_state["budget"] = budget_input
    
    st.markdown(f"**Anggaran Aktif:** Rp {budget_input:,.0f}")
    st.divider()
    
    st.info("Pilih menu pada sidebar atas untuk beralih ke 11 modul interaktif.")

# Main Dashboard View
st.markdown("""
<div class="peatra-header">
    <div>
        <h1 class="peatra-title">PEATRA Dashboard & Overview</h1>
        <div class="peatra-subtitle">Sistem Pendukung Keputusan Multi-Objektif Restorasi Gambut Berbasis Mixed-Integer Linear Programming</div>
    </div>
    <div class="peatra-tagline">
        Data yang tepat &rarr; Keputusan yang bijak &rarr; Gambut yang lebih lestari
    </div>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div class="banner-illustrative">
    ℹ️ <strong>CATATAN DATA DEMO:</strong> Seluruh data lokasi, koordinat, dan hidrologi dalam aplikasi ini berstatus <em>ILLUSTRATIVE</em> untuk tujuan pengujian model optimasi matematis dan simulasi kebijakan, bukan survei lapangan resmi tunggal.
</div>
""", unsafe_allow_html=True)

# Active Sites after Validated Monitoring
active_sites = apply_validated_monitoring(st.session_state["sites_df"], st.session_state["monitoring_df"])

# Optimization Computation
ind_df = calculate_indicators(active_sites, st.session_state["interventions_df"])
norm_df = normalize_indicators(ind_df, method="fixed_ref")
scored_df, weights = compute_weighted_score(
    norm_df, 
    st.session_state["w_R"], 
    st.session_state["w_W"], 
    st.session_state["w_E"]
)

milp_res = solve_milp_highs(scored_df, budget=st.session_state["budget"])
greedy_res = solve_greedy_baseline(scored_df, budget=st.session_state["budget"])
chosen_df = milp_res["df"][milp_res["df"]["selected"] == 1]
active_chosen = chosen_df[chosen_df["action"] != "no_intervention"]

# KPI Metrics Row
c1, c2, c3, c4 = st.columns(4)
with c1:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">Luas Kawasan KHG</div>
        <div class="kpi-value">791.374 ha</div>
        <div class="kpi-subtext">312.922 ha (39,5%) Rusak</div>
    </div>
    """, unsafe_allow_html=True)

with c2:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">Anggaran Tersedia</div>
        <div class="kpi-value">Rp {st.session_state['budget']/1e9:.2f} M</div>
        <div class="kpi-subtext">Terpakai: Rp {milp_res['total_cost']/1e9:.2f} M ({milp_res['total_cost']/st.session_state['budget']*100:.1f}%)</div>
    </div>
    """, unsafe_allow_html=True)

with c3:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">Lokasi Ditangani (MILP)</div>
        <div class="kpi-value">{milp_res['num_selected']} Lokasi</div>
        <div class="kpi-subtext">dari {len(active_sites)} Lokasi Kandidat</div>
    </div>
    """, unsafe_allow_html=True)

with c4:
    st.markdown(f"""
    <div class="kpi-card">
        <div class="kpi-label">Total Skor Manfaat (Z)</div>
        <div class="kpi-value">{milp_res['total_score']:.1f}</div>
        <div class="kpi-subtext">Status: {milp_res['status']}</div>
    </div>
    """, unsafe_allow_html=True)

st.write("")

# Two-column layout matching showcase
col_left, col_right = st.columns([7, 5])

with col_left:
    st.subheader("🗺️ Ringkasan Spasial & Titik Intervensi Terpilih")
    
    # Render table of selected interventions
    display_cols = ["site_id", "site_name", "action_label", "cost", "weighted_score", "hydrological_improvement", "delta_fire_risk"]
    sub_chosen = active_chosen[display_cols].copy()
    sub_chosen["cost"] = sub_chosen["cost"].apply(lambda x: f"Rp {x:,.0f}")
    sub_chosen["weighted_score"] = sub_chosen["weighted_score"].round(2)
    sub_chosen["hydrological_improvement"] = sub_chosen["hydrological_improvement"].apply(lambda x: f"+{x*100:.0f} cm")
    sub_chosen["delta_fire_risk"] = sub_chosen["delta_fire_risk"].apply(lambda x: f"-{x:.1f} poin")
    sub_chosen.columns = ["Kode", "Lokasi", "Rekomendasi Tindakan", "Biaya", "Skor (U)", "Kenaikan TMA", "Penurunan Risiko"]
    
    st.dataframe(sub_chosen, use_container_width=True, hide_index=True)
    
    st.caption("Pilihan di atas merupakan hasil optimasi global MILP yang memaksimalkan portofolio manfaat keseluruhan.")

with col_right:
    st.subheader("📊 Distribusi Rekomendasi Portofolio")
    fig_donut = plot_intervention_distribution(active_chosen)
    st.plotly_chart(fig_donut, use_container_width=True)
    
    st.markdown(f"""
    **Komparasi Solver vs Greedy Heuristik:**
    - Skor MILP HiGHS: **{milp_res['total_score']:.2f}**
    - Skor Greedy Rasio: **{greedy_res['total_score']:.2f}**
    - Efisiensi Peningkatan MILP: **+{((milp_res['total_score'] - greedy_res['total_score']) / greedy_res['total_score'] * 100 if greedy_res['total_score'] > 0 else 0):.1f}%**
    - Sisa Anggaran: **Rp {milp_res['remaining_budget']:,.0f}**
    """)

st.divider()

# Recent Monitoring strip
st.subheader("📋 Pemantauan Lapangan Terbaru (Monitoring Stream)")
mon_df = st.session_state["monitoring_df"].tail(5)
st.dataframe(mon_df, use_container_width=True, hide_index=True)
