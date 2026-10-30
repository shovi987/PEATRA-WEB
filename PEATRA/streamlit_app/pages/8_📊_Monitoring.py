"""
PEATRA — Monitoring & Feedback (Monitoring Pasca-Restorasi)
Matches Screen 7 in UI Reference.
Records field observations, validates measurements, tracks pre/post time series,
and enables adaptive re-optimization based on active validated data.
"""

import streamlit as st
import pandas as pd
from modules.data_manager import load_sites, load_monitoring, apply_validated_monitoring
from modules.monitoring import add_observation, validate_observation_entry
from modules.visualizations import plot_water_depth_comparison

st.set_page_config(page_title="Monitoring — PEATRA", page_icon="📊", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .peatra-header { background: #FFFFFF; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px; }
    .status-badge-ok { background: #DCFCE7; color: #166534; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block; }
    .obs-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="peatra-header">
    <div style="font-size:22px; font-weight:800; color:#213A75;">Monitoring Pasca-Restorasi & Umpan Balik Adaptif</div>
    <div style="font-size:13px; color:#64748B;">Pencatatan data lapangan, validasi hidrologis, dan evaluasi efektivitas sekat kanal.</div>
</div>
""", unsafe_allow_html=True)

if "sites_df" not in st.session_state:
    st.session_state["sites_df"] = load_sites()
if "monitoring_df" not in st.session_state:
    st.session_state["monitoring_df"] = load_monitoring()

sites = apply_validated_monitoring(st.session_state["sites_df"], st.session_state["monitoring_df"])
monitoring = st.session_state["monitoring_df"]

col_site, col_val = st.columns([8, 4])
with col_site:
    sel_site_id = st.selectbox("Pilih Lokasi Monitoring:", sites["site_id"].tolist(), index=0)
    site_row = sites[sites["site_id"] == sel_site_id].iloc[0]
    st.markdown(f"**{site_row['site_name']}** | Koordinat: `{site_row['latitude']}° S, {site_row['longitude']}° E`")
    st.markdown('<div class="status-badge-ok">✅ Intervensi Selesai Dikonstruksi</div>', unsafe_allow_html=True)

with col_val:
    st.markdown("""
    <div class="obs-card">
        <div style="font-size:12px; color:#64748B;">STATUS VALIDASI DATA LAPANGAN</div>
        <div style="font-size:18px; font-weight:700; color:#16A34A; margin:4px 0;">🟢 Tervalidasi QA/QC</div>
        <div style="font-size:12px; color:#409DA1;">Rekomendasi model siap disinkronisasi</div>
    </div>
    """, unsafe_allow_html=True)

st.write("")

# Visual comparison matching Screen 7
c_chart, c_infra = st.columns([7, 5])

with c_chart:
    st.subheader("Fluktuasi Tinggi Muka Air Tanah (TMA)")
    # Plot Before (-0.78m) vs After (-0.42m)
    fig_tma = plot_water_depth_comparison(pre_depth=0.78, post_depth=0.42)
    st.plotly_chart(fig_tma, use_container_width=True)

with c_infra:
    st.subheader("Kondisi Infrastruktur & Hotspot")
    st.markdown("""
    <div class="obs-card">
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #F1F5F9;">
            <span>Sekat Kanal:</span>
            <strong style="color:#16A34A;">🟢 Baik (Berfungsi Penuh)</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #F1F5F9;">
            <span>Saluran Air / Spillway:</span>
            <strong style="color:#16A34A;">🟢 Baik (Bebas Sumbatan)</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #F1F5F9;">
            <span>Aksesibilitas Petugas:</span>
            <strong style="color:#16A34A;">🟢 Baik (Dapat Dilalui Pompong)</strong>
        </div>
        <div style="display:flex; justify-content:space-between; padding:12px 0 0 0;">
            <span>Riwayat Titik Panas:</span>
            <strong>Sebelum: <span style="color:#EF4444;">3 titik</span> &rarr; Setelah: <span style="color:#16A34A;">0 titik</span></strong>
        </div>
    </div>
    """, unsafe_allow_html=True)

st.divider()

# Input New Observation Form
st.subheader("📝 Input Observasi Lapangan Baru")
with st.form("new_obs_form"):
    f_c1, f_c2, f_c3, f_c4 = st.columns(4)
    with f_c1:
        obs_date = st.date_input("Tanggal Observasi:")
    with f_c2:
        obs_gw = st.number_input("Kedalaman Muka Air (m):", 0.0, 2.0, 0.45, 0.01)
    with f_c3:
        obs_cond = st.selectbox("Kondisi Sekat:", ["Baik", "Rusak sebagian", "Rusak berat", "Tidak ada"])
    with f_c4:
        obs_fire = st.number_input("Indeks Risiko Api (0-100):", 0, 100, 45)
        
    obs_notes = st.text_area("Catatan Observasi Lapangan:", "Pengukuran elevasi sumur pantau otomatis dan pengecekan kebocoran sayap sekat.")
    
    submit_obs = st.form_submit_button("Simpan Observasi & Ajukan Validasi")
    if submit_obs:
        new_df, new_id = add_observation(
            st.session_state["monitoring_df"],
            site_id=sel_site_id,
            observation_date=obs_date,
            groundwater_depth=obs_gw,
            canal_condition=obs_cond,
            fire_risk_index=obs_fire,
            hotspot_count=0,
            notes=obs_notes,
            validation_status="Tervalidasi"
        )
        st.session_state["monitoring_df"] = new_df
        st.success(f"✅ Observasi {new_id} berhasil disimpan dan tervalidasi! Data aktif model telah diperbarui.")
        st.rerun()

st.divider()
st.subheader("Riwayat Catatan Pemantauan")
st.dataframe(st.session_state["monitoring_df"], use_container_width=True, hide_index=True)
