"""
PEATRA — Data & Methodology (Data dan Metodologi)
Comprehensive technical documentation of mathematical formulas, normalization scales,
MILP formulation, HiGHS solver, and environmental scenario assumptions.
"""

import streamlit as st
import pandas as pd
from modules.data_manager import load_sites, load_interventions, load_monitoring

st.set_page_config(page_title="Data & Metodologi — PEATRA", page_icon="📖", layout="wide")

st.markdown("""
<style>
    .stApp { background-color: #F7FAF8; font-family: 'Plus Jakarta Sans', sans-serif; }
    .peatra-header { background: #FFFFFF; padding: 16px 20px; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 20px; }
    .math-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="peatra-header">
    <div style="font-size:22px; font-weight:800; color:#213A75;">Dokumentasi Ilmiah, Formulasi Matematis, & Metodologi</div>
    <div style="font-size:13px; color:#64748B;">Spesifikasi matematis sistem optimasi multi-objektif PEATRA.</div>
</div>
""", unsafe_allow_html=True)

tab1, tab2, tab3 = st.tabs(["📐 Formulasi Matematis", "💻 Algoritma Solver MILP", "📂 Dataset & Sumber Data"])

with tab1:
    st.markdown("""
    ### 1. Indikator Manfaat Multi-Objektif

    #### A. Fire-Risk Reduction (R)
    Mengukur penurunan indeks kerentanan kebakaran setelah intervensi:
    $$\Delta F_{ia} = \max(0, F_i - F_{ia})$$
    *Keterangan:* $F_i$ indeks awal lokasi $i$, $F_{ia}$ indeks setelah tindakan $a$.

    #### B. Hydrological Improvement (W)
    Mengukur perbaikan elevasi muka air tanah terhadap ambang batas kepatuhan regulasi PP No. 57/2016 jo. PP No. 71/2014 ($d_{\\text{target}} = 0,40\\text{ m}$):
    $$D_i = \max(0, d_i - d_{\\text{target}})$$
    $$G_{ia} = \min(\max(0, \Delta h_{ia}), D_i)$$
    *Keterangan:* $d_i$ kedalaman muka air awal, $\Delta h_{ia}$ estimasi kenaikan muka air akibat sekat kanal.

    #### C. Ecological Benefit (E)
    Mengukur manfaat keanekaragaman hayati dan habitat:
    $$V_{ia} = \\left(\\frac{s_i}{100}\\right) \\times A_{ia}$$
    *Keterangan:* $s_i$ sensitivitas ekologis (0–100), $A_{ia}$ luas habitat terbasahi (hektare).

    ---

    ### 2. Normalisasi Skala Acuan Tetap (Fixed Reference)
    Agar skor dapat dibandingkan antarlokasi dan antarskenario:
    $$S(v) = 100 \\times \\min\\left(1, \\max\\left(0, \\frac{v}{v_{\\text{ref}}}\\right)\\right)$$
    - $\Delta F_{\\text{ref}} = 40\\text{ poin}$
    - $G_{\\text{ref}} = 0,60\\text{ meter}$
    - $V_{\\text{ref}} = 200\\text{ ha-ekuivalen}$

    $$U_{ia} = w_R R_{ia} + w_W W_{ia} + w_E E_{ia}, \\quad \\sum w = 1.0$$
    """)

with tab2:
    st.markdown("""
    ### Formulasi Binary Mixed-Integer Linear Programming (MILP)

    **Variabel Keputusan:**
    $x_{ia} \\in \\{0, 1\\}$, bernilai 1 jika intervensi $a$ dipilih pada lokasi $i$, dan 0 jika tidak.

    **Fungsi Objektif:**
    $$\\max Z = \\sum_{i} \\sum_{a} U_{ia} \\cdot x_{ia}$$

    **Kendala-Kendala (Constraints):**
    1. **Batas Anggaran (Budget Constraint):**
       $$\\sum_{i} \\sum_{a} C_{ia} \\cdot x_{ia} \\le B$$
    2. **Maksimal Satu Intervensi per Lokasi:**
       $$\\sum_{a} x_{ia} \\le 1, \\quad \\forall i$$
    3. **Kelayakan Teknis (Technical Feasibility):**
       $$x_{ia} \\le q_{ia}, \\quad q_{ia} \\in \\{0, 1\\}$$
       *(Contoh: Perbaikan sekat hanya diizinkan bila sekat eksisting ada; jika tidak ada sekat, $q_{ia} = 0$).*

    **Solver:**
    Menggunakan **SciPy `scipy.optimize.milp`** dengan mesin solver **HiGHS (High Performance Dual Simplex and Branch-and-Cut)**.
    """)

with tab3:
    st.markdown("### Unduh Data Demo Primer")
    st.caption("Semua dataset demo di bawah ini berstatus ilustratif untuk pemodelan SPK PEATRA.")
    
    st.write("**Dataset Lokasi (sites.csv):**")
    st.dataframe(load_sites().head(6), use_container_width=True)
    
    st.write("**Dataset Opsi Intervensi (interventions.csv):**")
    st.dataframe(load_interventions().head(6), use_container_width=True)
