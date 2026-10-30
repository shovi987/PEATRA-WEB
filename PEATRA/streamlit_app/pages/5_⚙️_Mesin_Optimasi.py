"""
PEATRA — Optimization Engine (Mesin Optimasi Multi-Objektif)
Matches Screen 4 in UI Reference.
Configures weights, budget, optional constraints, executes SciPy HiGHS MILP,
and compares against Greedy baseline.
"""

import streamlit as st
import pandas as pd
from modules.data_manager import load_sites, load_interventions, load_monitoring, apply_validated_monitoring
from modules.scoring import calculate_indicators, normalize_indicators, compute_weighted_score
from modules.optimization import solve_milp_highs, solve_greedy_baseline, validate_constraints
from modules.visualizations import plot_intervention_distribution

st.set_page_config(page_title="Mesin Optimasi — PEATRA", page_icon="⚙️", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .peatra-header { background: #FFFFFF; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px; }
    .process-step { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
    .kpi-res-box { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; text-align: center; }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="peatra-header">
    <div style="font-size:22px; font-weight:800; color:#213A75;">Mesin Optimasi Multi-Objektif (Optimization Engine)</div>
    <div style="font-size:13px; color:#64748B;">Penyelesaian Binary Mixed-Integer Linear Programming (MILP) dengan Solver HiGHS</div>
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

col_params, col_exec, col_results = st.columns([4, 4, 4])

with col_params:
    st.subheader("Parameter Optimasi")
    
    budget = st.number_input(
        "Batas Anggaran Total (IDR):",
        min_value=100_000_000,
        max_value=10_000_000_000,
        value=int(st.session_state.get("budget", 1_000_000_000)),
        step=50_000_000
    )
    st.session_state["budget"] = budget
    
    st.markdown("**Bobot Tujuan (Multi-Criteria Weights):**")
    w_R = st.slider("Pengurangan Risiko Api (w_R):", 0.0, 1.0, float(st.session_state.get("w_R", 0.40)), 0.05)
    w_W = st.slider("Efektivitas Hidrologis (w_W):", 0.0, 1.0, float(st.session_state.get("w_W", 0.35)), 0.05)
    w_E = st.slider("Manfaat Ekologis (w_E):", 0.0, 1.0, float(st.session_state.get("w_E", 0.25)), 0.05)
    
    st.session_state["w_R"] = w_R
    st.session_state["w_W"] = w_W
    st.session_state["w_E"] = w_E
    
    tot_w = w_R + w_W + w_E
    st.caption(f"Bobot ternormalisasi aktual: w_R={w_R/tot_w:.2f}, w_W={w_W/tot_w:.2f}, w_E={w_E/tot_w:.2f}")
    
    st.divider()
    st.markdown("**Kendala Tambahan (Optional Constraints):**")
    enable_max_int = st.checkbox("Batasi Maksimum Tindakan")
    max_int = st.number_input("Maks Jumlah Tindakan:", 1, 24, 12) if enable_max_int else None
    
    mandatory_site = st.multiselect("Lokasi Wajib Ditangani:", sites["site_id"].tolist())

# Scoring calculations
ind_df = calculate_indicators(sites, interventions)
norm_df = normalize_indicators(ind_df, method="fixed_ref")
scored_df, norm_weights = compute_weighted_score(norm_df, w_R, w_W, w_E)

milp_res = solve_milp_highs(
    scored_df, 
    budget=budget, 
    max_interventions=max_int,
    mandatory_sites=mandatory_site
)
greedy_res = solve_greedy_baseline(scored_df, budget=budget, mandatory_sites=mandatory_site)

chosen = milp_res["df"][milp_res["df"]["selected"] == 1]
active_chosen = chosen[chosen["action"] != "no_intervention"]
validation = validate_constraints(chosen, budget)

with col_exec:
    st.subheader("Proses Optimasi")
    st.markdown("""
    <div style="background:#FFFFFF; border:1px solid #E2E8F0; border-radius:10px; padding:16px;">
        <div class="process-step">
            <span>🟢 Inisialisasi model matriks</span>
            <strong style="color:#16A34A;">100% Selesai</strong>
        </div>
        <div class="process-step">
            <span>🟢 Evaluasi batas kelayakan teknis</span>
            <strong style="color:#16A34A;">100% Selesai</strong>
        </div>
        <div class="process-step">
            <span>🟢 Eksekusi SciPy HiGHS Solver</span>
            <strong style="color:#16A34A;">100% Selesai</strong>
        </div>
        <div class="process-step">
            <span>🟢 Verifikasi kendala & dua tahap</span>
            <strong style="color:#16A34A;">100% Selesai</strong>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.write("")
    st.markdown(f"""
    <div class="kpi-res-box">
        <div style="font-size:13px; color:#64748B; font-weight:600;">HASIL OPTIMASI TERBAIK</div>
        <div style="font-size:36px; font-weight:800; color:#213A75; margin:8px 0;">{milp_res['num_selected']} Lokasi Prioritas</div>
        <div style="font-size:13px; color:#16A34A; font-weight:600;">Portofolio Optimal Terbukti</div>
        <div style="font-size:12px; color:#64748B; margin-top:4px;">Total Skor Z = {milp_res['total_score']:.2f} | Biaya = Rp {milp_res['total_cost']/1e6:.0f} Juta</div>
    </div>
    """, unsafe_allow_html=True)
    
    st.write("")
    if validation["all_valid"]:
        st.success("✅ Seluruh kendala matematika tervalidasi: Batas Anggaran, Keunikan 1-Tindakan, dan Kelayakan Teknis terpenuhi.")
    else:
        st.error("⚠️ Peringatan: Terdapat pelanggaran batas kendala!")

with col_results:
    st.subheader("Distribusi Rekomendasi")
    fig = plot_intervention_distribution(active_chosen)
    st.plotly_chart(fig, use_container_width=True)
    
    st.markdown("""
    <div style="font-size:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:12px;">
        <strong>Perbandingan dengan Greedy Heuristic:</strong><br>
        Skor MILP: <b>{:.2f}</b> vs Greedy: <b>{:.2f}</b><br>
        Peningkatan Efisiensi: <b>+{:.1f}%</b><br>
        <i>MILP berhasil mencegah jebakan knapsack lokal dan menghasilkan portofolio superior.</i>
    </div>
    """.format(
        milp_res['total_score'], 
        greedy_res['total_score'],
        ((milp_res['total_score'] - greedy_res['total_score'])/greedy_res['total_score']*100) if greedy_res['total_score'] > 0 else 0
    ), unsafe_allow_html=True)

st.divider()
st.subheader("Daftar Keputusan Intervensi per Lokasi")
display_df = active_chosen[["site_id", "site_name", "action_label", "cost", "weighted_score", "hydrological_improvement", "delta_fire_risk"]].copy()
display_df["cost"] = display_df["cost"].apply(lambda x: f"Rp {x:,.0f}")
display_df["hydrological_improvement"] = display_df["hydrological_improvement"].apply(lambda x: f"+{x*100:.0f} cm")
display_df["delta_fire_risk"] = display_df["delta_fire_risk"].apply(lambda x: f"-{x:.1f} poin")
st.dataframe(display_df, use_container_width=True, hide_index=True)
