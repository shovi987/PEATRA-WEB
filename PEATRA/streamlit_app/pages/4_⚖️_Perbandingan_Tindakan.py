"""
PEATRA — Intervention Comparison (Perbandingan Opsi Tindakan)
Matches Screen 3 in UI Reference.
Direct head-to-head comparison between Repair, New Build, and No Intervention.
"""

import streamlit as st
import pandas as pd
from modules.data_manager import load_sites, load_interventions, load_monitoring, apply_validated_monitoring
from modules.scoring import calculate_indicators, normalize_indicators, compute_weighted_score

st.set_page_config(page_title="Perbandingan Tindakan — PEATRA", page_icon="⚖️", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .action-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .action-title {
        font-size: 18px;
        font-weight: 700;
        color: #213A75;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .metric-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #F1F5F9;
        font-size: 14px;
    }
    .rec-box {
        background: #F0FDF4;
        border: 1px solid #86EFAC;
        padding: 16px 20px;
        border-radius: 10px;
        margin-top: 24px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
    }
</style>
""", unsafe_allow_html=True)

if "sites_df" not in st.session_state:
    st.session_state["sites_df"] = load_sites()
if "interventions_df" not in st.session_state:
    st.session_state["interventions_df"] = load_interventions()
if "monitoring_df" not in st.session_state:
    st.session_state["monitoring_df"] = load_monitoring()

sites = apply_validated_monitoring(st.session_state["sites_df"], st.session_state["monitoring_df"])
interventions = st.session_state["interventions_df"]

selected_site = st.selectbox("Pilih Lokasi untuk Dibandingkan:", sites["site_id"].tolist(), index=0)

site_row = sites[sites["site_id"] == selected_site].iloc[0]
site_actions = interventions[interventions["site_id"] == selected_site]

repair_row = site_actions[site_actions["action"] == "repair"]
new_row = site_actions[site_actions["action"] == "new_build"]

st.title(f"Perbandingan Opsi Tindakan: {site_row['site_name']}")
st.caption(f"Evaluasi teknis dan rasio biaya-manfaat intervensi restorasi pada titik {selected_site}")

# Calculate weighted scores
ind_df = calculate_indicators(sites, interventions)
norm_df = normalize_indicators(ind_df, method="fixed_ref")
scored_df, _ = compute_weighted_score(norm_df, w_R=0.40, w_W=0.35, w_E=0.25)
site_scored = scored_df[scored_df["site_id"] == selected_site]

col1, col2, col3 = st.columns(3)

# 1. Repair
with col1:
    rep_s = site_scored[site_scored["action"] == "repair"].iloc[0] if not repair_row.empty else None
    is_feas = rep_s["technical_feasibility"] == 1 if rep_s is not None else False
    st.markdown(f"""
    <div class="action-card">
        <div class="action-title">🔧 Perbaikan Sekat Lama</div>
        <div class="metric-row">
            <span style="color:#64748B;">Kelayakan Teknis</span>
            <span style="font-weight:600; color:{'#16A34A' if is_feas else '#DC2626'};">{'Layak (Ada Sekat)' if is_feas else 'Tidak Layak (Sekat Hilang)'}</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Estimasi Biaya</span>
            <span style="font-weight:700; color:#213A75;">Rp {rep_s['cost']/1e6:.0f} Juta</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Manfaat Pembasahan</span>
            <span style="font-weight:600; color:#0D9488;">+{rep_s['hydrological_improvement']*100:.0f} cm</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Penurunan Risiko Api</span>
            <span style="font-weight:600; color:#EA580C;">-{rep_s['delta_fire_risk']:.1f} poin ({rep_s['delta_fire_risk']/site_row['fire_risk_index']*100:.0f}%)</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Skor Manfaat (U_ia)</span>
            <span style="font-weight:700; color:#2563EB;">{rep_s['weighted_score']:.2f}</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Efisiensi (Skor / Rp Miliar)</span>
            <span style="font-weight:600; color:#059669;">{(rep_s['weighted_score'] / (rep_s['cost']/1e9)):.2f}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# 2. New Build
with col2:
    new_s = site_scored[site_scored["action"] == "new_build"].iloc[0] if not new_row.empty else None
    st.markdown(f"""
    <div class="action-card">
        <div class="action-title">🏗️ Pembangunan Sekat Baru</div>
        <div class="metric-row">
            <span style="color:#64748B;">Kelayakan Teknis</span>
            <span style="font-weight:600; color:#16A34A;">Layak Konstruksi Baru</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Estimasi Biaya</span>
            <span style="font-weight:700; color:#213A75;">Rp {new_s['cost']/1e6:.0f} Juta</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Manfaat Pembasahan</span>
            <span style="font-weight:600; color:#0D9488;">+{new_s['hydrological_improvement']*100:.0f} cm</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Penurunan Risiko Api</span>
            <span style="font-weight:600; color:#EA580C;">-{new_s['delta_fire_risk']:.1f} poin ({new_s['delta_fire_risk']/site_row['fire_risk_index']*100:.0f}%)</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Skor Manfaat (U_ia)</span>
            <span style="font-weight:700; color:#2563EB;">{new_s['weighted_score']:.2f}</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Efisiensi (Skor / Rp Miliar)</span>
            <span style="font-weight:600; color:#059669;">{(new_s['weighted_score'] / (new_s['cost']/1e9)):.2f}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# 3. No Intervention
with col3:
    st.markdown("""
    <div class="action-card">
        <div class="action-title">⏸️ Tanpa Intervensi</div>
        <div class="metric-row">
            <span style="color:#64748B;">Kelayakan Teknis</span>
            <span style="font-weight:600; color:#64748B;">Selalu Tersedia</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Estimasi Biaya</span>
            <span style="font-weight:700; color:#213A75;">Rp 0</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Manfaat Pembasahan</span>
            <span style="font-weight:600; color:#94A3B8;">0 cm</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Penurunan Risiko Api</span>
            <span style="font-weight:600; color:#94A3B8;">0 poin (Risiko Tetap)</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Skor Manfaat (U_ia)</span>
            <span style="font-weight:700; color:#94A3B8;">0.00</span>
        </div>
        <div class="metric-row">
            <span style="color:#64748B;">Dampak Jangka Panjang</span>
            <span style="font-weight:600; color:#DC2626;">Degradasi Bertambah</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# Recommendation Box
st.markdown("""
<div class="rec-box">
    <div style="font-size:24px;">✅</div>
    <div>
        <strong style="color:#166534; font-size:15px;">Rekomendasi Portofolio PEATRA:</strong><br>
        <span style="color:#15803D; font-size:13px;">
        Pada tingkat lokal, <strong>Perbaikan Sekat Lama</strong> menawarkan rasio efisiensi biaya tertinggi (Rp 350 juta untuk penurunan risiko signifikan dan kenaikan muka air +12 cm). Namun, dalam skenario optimasi global MILP dengan batas anggaran tertentu, sistem mungkin memilih <em>Pembangunan Sekat Baru</em> jika sisa anggaran masih mencukupi untuk memaksimalkan total skor lanskap!
        </span>
    </div>
</div>
""", unsafe_allow_html=True)
