"""
PEATRA — Peatland Map (Peta Kondisi Gambut)
Displays interactive map, layers, canal networks, and site details.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from modules.data_manager import load_sites, load_interventions, load_monitoring, apply_validated_monitoring

st.set_page_config(page_title="Peta Kondisi Gambut — PEATRA", page_icon="🗺️", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .peatra-header { background: #FFFFFF; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px; }
    .peatra-title { font-size: 22px; font-weight: 800; color: #213A75; }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="peatra-header">
    <div class="peatra-title">Peta Kondisi Gambut (Peatland Map)</div>
    <div style="font-size:13px; color:#64748B;">KHG Sungai Kampar - Gaung | Lapisan Risiko Kebakaran, Jaringan Kanal, & Kondisi Sekat</div>
</div>
""", unsafe_allow_html=True)

if "sites_df" not in st.session_state:
    st.session_state["sites_df"] = load_sites()
if "monitoring_df" not in st.session_state:
    st.session_state["monitoring_df"] = load_monitoring()

sites = apply_validated_monitoring(st.session_state["sites_df"], st.session_state["monitoring_df"])

col_filters, col_map, col_info = st.columns([3, 6, 3])

with col_filters:
    st.subheader("Filter Lapisan (Layers)")
    layer_mode = st.radio(
        "Tampilan Lapisan:",
        ["Semua Layer", "Kondisi Sekat Kanal", "Tinggi Muka Air (TMA)", "Indeks Risiko Kebakaran"]
    )
    
    land_cover_filter = st.multiselect(
        "Tutupan Lahan:",
        options=sites["land_cover"].unique(),
        default=sites["land_cover"].unique()
    )
    
    filtered_sites = sites[sites["land_cover"].isin(land_cover_filter)]
    
    st.divider()
    st.markdown("""
    **Legenda Peta:**
    - 🔵 Sekat Kanal Baik / Terpelihara
    - 🟠 Sekat Kanal Rusak Sebagian (Perlu Perbaikan)
    - 🔴 Sekat Rusak Berat / Rawan Kebakaran Tinggi
    - ⚪ Belum Memiliki Sekat
    """)

with col_map:
    # Color mapping according to active layer
    if layer_mode == "Kondisi Sekat Kanal":
        color_col = "canal_condition"
        color_map = {
            "Baik": "#54B79A",
            "Rusak sebagian": "#F59E0B",
            "Rusak berat": "#EF4444",
            "Tidak ada": "#94A3B8"
        }
    elif layer_mode == "Tinggi Muka Air (TMA)":
        color_col = "groundwater_depth"
        color_map = None
    elif layer_mode == "Indeks Risiko Kebakaran":
        color_col = "fire_risk_index"
        color_map = None
    else:
        color_col = "canal_condition"
        color_map = {
            "Baik": "#54B79A",
            "Rusak sebagian": "#F59E0B",
            "Rusak berat": "#EF4444",
            "Tidak ada": "#94A3B8"
        }

    fig = px.scatter_mapbox(
        filtered_sites,
        lat="latitude",
        lon="longitude",
        hover_name="site_name",
        hover_data={
            "groundwater_depth": ":.2f m",
            "fire_risk_index": ":.1f",
            "canal_condition": True,
            "latitude": False,
            "longitude": False
        },
        color=color_col,
        color_discrete_map=color_map,
        color_continuous_scale="RdYlGn_r" if color_col in ["fire_risk_index", "groundwater_depth"] else None,
        size="affected_area",
        size_max=16,
        zoom=10,
        center={"lat": -0.25, "lon": 101.85},
        mapbox_style="carto-positron",
        title=f"Sebaran Titik Pemantauan ({layer_mode})"
    )
    fig.update_layout(
        margin={"r": 0, "t": 30, "l": 0, "b": 0},
        height=480,
        paper_bgcolor="#FFFFFF"
    )
    st.plotly_chart(fig, use_container_width=True)

with col_info:
    st.subheader("Ringkasan KHG")
    st.markdown("""
    <div style='background:#FFFFFF; padding:16px; border-radius:10px; border:1px solid #E2E8F0;'>
        <div style='font-size:12px; color:#64748B;'>Luas Kawasan Gambut</div>
        <div style='font-size:20px; font-weight:700; color:#213A75;'>791.374 ha</div>
        <hr style='margin:10px 0;'>
        <div style='font-size:12px; color:#64748B;'>Luas Rusak Ringan-Berat</div>
        <div style='font-size:20px; font-weight:700; color:#EF4444;'>312.922 ha (39,5%)</div>
        <hr style='margin:10px 0;'>
        <div style='font-size:12px; color:#64748B;'>Titik Panas (5 Th Terakhir)</div>
        <div style='font-size:20px; font-weight:700; color:#F59E0B;'>48 Titik</div>
        <hr style='margin:10px 0;'>
        <div style='font-size:12px; color:#64748B;'>Sekat Kanal Terdata</div>
        <div style='font-size:20px; font-weight:700; color:#2F698B;'>32 Unit</div>
    </div>
    """, unsafe_allow_html=True)
    
    st.caption("Pilih marker pada peta untuk melihat koordinat presisi dan profil degradasi.")
