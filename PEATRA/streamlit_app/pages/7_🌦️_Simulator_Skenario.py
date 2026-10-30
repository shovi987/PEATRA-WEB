"""
PEATRA — Scenario Simulator (Simulator Skenario Lingkungan)
Matches Screen 6 in UI Reference.
Simulates Normal, Dry Season, and Elevated Fire Risk conditions,
displaying indicator shifts, portfolio transitions, and minimax regret matrix.
"""

import streamlit as st
import pandas as pd
import numpy as np
from modules.data_manager import load_sites, load_interventions, load_monitoring, apply_validated_monitoring
from modules.scenarios import apply_environmental_scenario
from modules.scoring import calculate_indicators, normalize_indicators, compute_weighted_score
from modules.optimization import solve_milp_highs

st.set_page_config(page_title="Simulator Skenario — PEATRA", page_icon="🌦️", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .peatra-header { background: #FFFFFF; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px; }
    .scenario-btn { border-radius: 10px; padding: 16px; border: 1px solid #E2E8F0; background: #FFFFFF; cursor: pointer; text-align: center; }
    .active-scen { border-color: #409DA1; background: #F0FDFA; }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="peatra-header">
    <div style="font-size:22px; font-weight:800; color:#213A75;">Simulator Skenario Iklim & Risiko (Scenario Simulator)</div>
    <div style="font-size:13px; color:#64748B;">Perbandingan ketahanan portofolio restorasi pada kondisi normal, musim kemarau ekstrem, dan ancaman api tinggi.</div>
</div>
""", unsafe_allow_html=True)

if "sites_df" not in st.session_state:
    st.session_state["sites_df"] = load_sites()
if "interventions_df" not in st.session_state:
    st.session_state["interventions_df"] = load_interventions()
if "monitoring_df" not in st.session_state:
    st.session_state["monitoring_df"] = load_monitoring()

base_sites = apply_validated_monitoring(st.session_state["sites_df"], st.session_state["monitoring_df"])
base_interventions = st.session_state["interventions_df"]
budget = st.session_state.get("budget", 1_000_000_000)

scen_choice = st.radio(
    "Pilih Skenario Lingkungan:",
    ["Normal (Kondisi saat ini)", "Musim Kering (Dry Season)", "Risiko Kebakaran Tinggi (Elevated Fire Risk)"],
    horizontal=True
)

scenario_key = "Normal" if "Normal" in scen_choice else ("Musim Kering" if "Kering" in scen_choice else "Risiko Kebakaran Tinggi")

# Run Base
ind_base = calculate_indicators(base_sites, base_interventions)
norm_base = normalize_indicators(ind_base)
scored_base, _ = compute_weighted_score(norm_base)
milp_base = solve_milp_highs(scored_base, budget=budget)

# Run Selected Scenario
sim_sites, sim_interventions = apply_environmental_scenario(base_sites, base_interventions, scenario_key)
ind_sim = calculate_indicators(sim_sites, sim_interventions)
norm_sim = normalize_indicators(ind_sim)
scored_sim, _ = compute_weighted_score(norm_sim)
milp_sim = solve_milp_highs(scored_sim, budget=budget)

chosen_sim = milp_sim["df"][milp_sim["df"]["selected"] == 1]
active_sim = chosen_sim[chosen_sim["action"] != "no_intervention"]

col1, col2 = st.columns([6, 6])

with col1:
    st.subheader(f"Perubahan Kondisi ({scenario_key})")
    
    avg_gw_base = base_sites["groundwater_depth"].mean()
    avg_gw_sim = sim_sites["groundwater_depth"].mean()
    
    avg_fire_base = base_sites["fire_risk_index"].mean()
    avg_fire_sim = sim_sites["fire_risk_index"].mean()
    
    st.markdown(f"""
    <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:12px; padding:20px;">
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #F1F5F9;">
            <span>Tinggi Muka Air Rata-rata:</span>
            <strong>-{avg_gw_base:.2f} m &rarr; <span style="color:#EF4444;">-{avg_gw_sim:.2f} m</span></strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #F1F5F9;">
            <span>Indeks Risiko Api Rata-rata:</span>
            <strong>{avg_fire_base:.1f} &rarr; <span style="color:#EA580C;">{avg_fire_sim:.1f}</span></strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #F1F5F9;">
            <span>Lokasi Terpilih (MILP):</span>
            <strong>{milp_base['num_selected']} &rarr; <span style="color:#2563EB;">{milp_sim['num_selected']} Lokasi</span></strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:10px 0;">
            <span>Arah Rekomendasi:</span>
            <strong style="color:#059669;">{'Fokus Konsolidasi Sekat' if scenario_key == 'Normal' else ('Prioritaskan Pembasahan Intensif' if 'Kering' in scenario_key else 'Perlindungan Sekat Baru Lahan Kritis')}</strong>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.subheader("Matriks Penyesalan (Regret Analysis)")
    st.markdown("""
    Evaluasi *opportunity loss* (penyesalan) jika portofolio yang dirancang untuk satu skenario dihadapkan pada realitas skenario lain.
    """)
    
    # Illustrative Regret Matrix
    regret_data = {
        "Desain Portofolio": ["Portofolio Normal", "Portofolio Musim Kering", "Portofolio Risiko Api Tinggi"],
        "Jika Realitas Normal": [0.0, 4.2, 5.8],
        "Jika Realitas Kemarau": [12.4, 0.0, 3.1],
        "Jika Realitas Api Tinggi": [15.6, 2.8, 0.0],
        "Maksimum Penyesalan": [15.6, 4.2, 5.8]
    }
    st.dataframe(pd.DataFrame(regret_data), use_container_width=True, hide_index=True)
    st.caption("Solusi *Minimax Regret* merekomendasikan desain tangguh yang meminimalkan kerugian pada kondisi iklim terburuk.")

st.divider()
st.subheader("Daftar Lokasi Terpilih pada Skenario Ini")
st.dataframe(active_sim[["site_id", "site_name", "action_label", "cost", "weighted_score"]], use_container_width=True, hide_index=True)
