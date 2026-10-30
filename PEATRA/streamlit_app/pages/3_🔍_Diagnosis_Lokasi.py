"""
PEATRA — Site Diagnosis (Diagnosis Lokasi)
Matches Screen 2 in UI Reference. Detailed site diagnosis, groundwater deficit,
hotspot history, and restoration requirements.
"""

import streamlit as st
import pandas as pd
from modules.data_manager import load_sites, load_monitoring, apply_validated_monitoring

st.set_page_config(page_title="Diagnosis Lokasi — PEATRA", page_icon="🔍", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .diag-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 18px 20px;
        margin-bottom: 16px;
    }
    .diag-title { font-size: 13px; font-weight: 600; color: #64748B; text-transform: uppercase; }
    .diag-val { font-size: 24px; font-weight: 700; color: #213A75; margin-top: 4px; }
    .badge-urgent {
        background: #FEE2E2;
        color: #991B1B;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 12px;
        display: inline-block;
    }
    .diagnosis-summary-box {
        background: #F0FDF4;
        border: 1px solid #86EFAC;
        padding: 16px 20px;
        border-radius: 10px;
        color: #14532D;
        font-size: 14px;
        line-height: 1.5;
        margin-top: 16px;
    }
</style>
""", unsafe_allow_html=True)

if "sites_df" not in st.session_state:
    st.session_state["sites_df"] = load_sites()
if "monitoring_df" not in st.session_state:
    st.session_state["monitoring_df"] = load_monitoring()

sites = apply_validated_monitoring(st.session_state["sites_df"], st.session_state["monitoring_df"])

site_list = sites["site_id"].tolist()
selected_site_id = st.selectbox("Pilih Lokasi yang Didiagnosis:", site_list, index=0)

site_row = sites[sites["site_id"] == selected_site_id].iloc[0]

# Breadcrumb & Header
st.caption(f"KHG Sungai Kampar - Gaung &gt; {site_row['site_name']}")
c_head1, c_head2 = st.columns([8, 4])
with c_head1:
    st.title(f"Detail Lokasi: {site_row['site_name']}")
    st.write(f"Koordinat: `{site_row['latitude']}° S, {site_row['longitude']}° E` | Tutupan: **{site_row['land_cover']}**")
with c_head2:
    st.write("")
    st.markdown('<div class="badge-urgent">⚠️ Prioritas Tinggi Restorasi</div>', unsafe_allow_html=True)

st.write("")

# Diagnostic Grid (matching UI reference Screen 2)
col1, col2, col3, col4 = st.columns(4)

with col1:
    deficit = round(site_row['groundwater_depth'] - 0.40, 2)
    st.markdown(f"""
    <div class="diag-card">
        <div class="diag-title">Tinggi Muka Air (TMA)</div>
        <div class="diag-val" style="color:#EF4444;">-{site_row['groundwater_depth']:.2f} m</div>
        <div style="font-size:12px; color:#DC2626; margin-top:4px;">Defisit {deficit:.2f} m di bawah normal 0.40m</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    fire_idx = site_row['fire_risk_index']
    risk_label = "Sangat Tinggi" if fire_idx > 75 else ("Tinggi" if fire_idx > 50 else "Sedang")
    st.markdown(f"""
    <div class="diag-card">
        <div class="diag-title">Risiko Kebakaran</div>
        <div class="diag-val" style="color:#EA580C;">{risk_label}</div>
        <div style="font-size:12px; color:#C2410C; margin-top:4px;">Indeks Kerentanan: {fire_idx:.1f} / 100</div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown(f"""
    <div class="diag-card">
        <div class="diag-title">Kondisi Sekat Kanal</div>
        <div class="diag-val" style="color:#2563EB;">{site_row['canal_condition']}</div>
        <div style="font-size:12px; color:#475569; margin-top:4px;">Efektivitas penahanan air: {'50%' if site_row['canal_condition'] == 'Rusak sebagian' else ('20%' if site_row['canal_condition'] == 'Rusak berat' else ('0%' if site_row['canal_condition'] == 'Tidak ada' else '90%'))}</div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    st.markdown(f"""
    <div class="diag-card">
        <div class="diag-title">Sensitivitas Ekologis</div>
        <div class="diag-val" style="color:#059669;">{site_row['ecological_sensitivity']} / 100</div>
        <div style="font-size:12px; color:#047857; margin-top:4px;">Luas Terdampak: {site_row['affected_area']} ha</div>
    </div>
    """, unsafe_allow_html=True)

# Historical Hotspots & Narrative Box
c_hist, c_diag = st.columns([5, 7])

with c_hist:
    st.subheader("🔥 Riwayat Titik Panas Historis")
    st.markdown("""
    - 🔴 **12 Jun 2025** — Titik panas terkonfirmasi patroli darat (Confidence 85%)
    - 🔴 **03 Sep 2024** — Deteksi satelit MODIS Terra/Aqua (FRP 24 MW)
    - 🔴 **21 Jul 2023** — Kebakaran semak belukar permukaan (Luas 4 ha)
    - 🔴 **14 Okt 2022** — Deteksi satelit VIIRS SNPP (Confidence 90%)
    """)

with c_diag:
    st.subheader("💡 Kesimpulan Diagnosis Teknis")
    st.markdown(f"""
    <div class="diagnosis-summary-box">
        <strong>Hasil Diagnosis Sistem PEATRA:</strong><br>
        Lokasi <strong>{site_row['site_name']}</strong> menunjukkan defisit hidrologis signifikan sebesar {deficit:.2f} m di bawah ambang kepatuhan PP No. 57/2016. Kondisi sekat kanal saat ini ({site_row['canal_condition']}) tidak mampu menahan laju penurunan air tanah pada musim kemarau.<br><br>
        <strong>Rekomendasi Tindakan Teknis:</strong><br>
        Lokasi ini memerlukan tindakan pembasahan ulang (rewetting) segera melalui perbaikan/pembangunan sekat kanal bertingkat untuk menaikkan muka air tanah minimal 12–18 cm dan menurunkan risiko kebakaran berulang.
    </div>
    """, unsafe_allow_html=True)
