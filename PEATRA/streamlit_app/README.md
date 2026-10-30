# PEATRA — Adaptive Multi-Objective Peatland Restoration Optimizer

**PEATRA** adalah Sistem Pendukung Keputusan (Decision Support System) berbasis optimasi matematis **Binary Mixed-Integer Linear Programming (MILP)** dengan solver **SciPy HiGHS** untuk perencanaan restorasi ekosistem lahan gambut multi-objektif.

Wilayah Pilot: **Kesatuan Hidrologis Gambut (KHG) Sungai Kampar - Gaung, Kabupaten Pelalawan, Provinsi Riau**.

---

## 🌿 Identitas Visual Resmi

- `#84E488` (Light Green / Positive Status)
- `#6BCE90` (Green / Progress & Health)
- `#54B79A` (Teal / Metric & Accents)
- `#409DA1` (Teal Dark / Active Navigation & Focus)
- `#2F698B` (Blue / Primary Actions & Solver Highlights)
- `#213A75` (Navy / Headings & Identity)
- `#F7FAF8` (Neutral Background)

---

## 📐 Formulasi Matematis

1. **Fire-Risk Reduction ($R$):**
   $$\Delta F_{ia} = \max(0, F_i - F_{ia})$$
   Normalisasi acuan tetap ($\Delta F_{\text{ref}} = 40$ poin):
   $$R_{ia} = 100 \times \min(1, \max(0, \Delta F_{ia} / \Delta F_{\text{ref}}))$$

2. **Hydrological Improvement ($W$):**
   $$D_i = \max(0, d_i - d_{\text{target}}), \quad d_{\text{target}} = 0,40\text{ m}$$
   $$G_{ia} = \min(\max(0, \Delta h_{ia}), D_i)$$
   Normalisasi acuan tetap ($G_{\text{ref}} = 0,60\text{ m}$):
   $$W_{ia} = 100 \times \min(1, \max(0, G_{ia} / G_{\text{ref}}))$$

3. **Ecological Benefit ($E$):**
   $$V_{ia} = (s_i / 100) \times A_{ia}$$
   Normalisasi acuan tetap ($V_{\text{ref}} = 200\text{ ha-eq}$):
   $$E_{ia} = 100 \times \min(1, \max(0, V_{ia} / V_{\text{ref}}))$$

4. **Multi-Criteria Score ($U_{ia}$):**
   $$U_{ia} = w_R R_{ia} + w_W W_{ia} + w_E E_{ia}, \quad \sum w = 1.0$$

5. **Binary Mixed-Integer Linear Program (MILP):**
   $$\max Z = \sum_{i,a} U_{ia} x_{ia}$$
   Subject to:
   - $\sum_{i,a} C_{ia} x_{ia} \le B$ (Batas Anggaran)
   - $\sum_a x_{ia} \le 1, \quad \forall i$ (Maksimal 1 intervensi per lokasi)
   - $x_{ia} \le q_{ia}$ (Kelayakan teknis)
   - $x_{ia} \in \{0, 1\}$

---

## 🚀 Cara Menjalankan Aplikasi di Komputer Lokal

### 1. Prasyarat
- Python 3.9, 3.10, atau 3.11
- Git

### 2. Kloning / Ekstrak Repositori
```bash
git clone https://github.com/USERNAME/peatra-optimizer.git
cd peatra-optimizer
```

### 3. Buat Virtual Environment & Pasang Dependensi
```bash
python3 -m venv venv
source venv/bin/activate  # Untuk Linux/macOS
# Atau: venv\Scripts\activate untuk Windows

pip install -r streamlit_app/requirements.txt
```

### 4. Jalankan Unit Test Matematis
```bash
python3 -m unittest streamlit_app/tests/test_optimization.py
# Atau jalankan pure-Python validator:
python3 streamlit_app/tests/test_math_pure.py
```

### 5. Jalankan Aplikasi Streamlit
```bash
streamlit run streamlit_app/app.py
```
Aplikasi akan terbuka otomatis di peramban web pada alamat `http://localhost:8501`.

---

## 🌐 Panduan Publikasi ke Streamlit Community Cloud

1. Buat repositori baru di akun GitHub Anda (misal: `peatra-optimizer`).
2. Push seluruh berkas ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete PEATRA application"
   git branch -M main
   git remote add origin https://github.com/USERNAME/peatra-optimizer.git
   git push -u origin main
   ```
3. Buka [share.streamlit.io](https://share.streamlit.io/).
4. Klik tombol **New app**.
5. Pilih repositori `USERNAME/peatra-optimizer`, branch `main`, dan Main file path: `streamlit_app/app.py`.
6. Klik **Deploy!**

---

## 📂 Struktur Berkas Proyek

```
PEATRA/
├── streamlit_app/
│   ├── app.py                      # Main Entrypoint & Dashboard
│   ├── requirements.txt            # Dependensi Python
│   ├── README.md                   # Dokumentasi teknis & deployment
│   ├── data/
│   │   ├── sites.csv               # 24 lokasi pilot KHG Sungai Kampar
│   │   ├── interventions.csv       # Opsi tindakan, biaya, & kelayakan
│   │   └── monitoring.csv          # Catatan observasi historis & validasi
│   ├── modules/
│   │   ├── data_manager.py         # Tata kelola & sinkronisasi data
│   │   ├── scoring.py              # Perhitungan R, W, E & normalisasi
│   │   ├── optimization.py         # MILP HiGHS solver & Greedy baseline
│   │   ├── scenarios.py            # Simulasi iklim & faktor kebakaran
│   │   ├── sensitivity.py          # Analisis sensitivitas & Monte Carlo
│   │   ├── monitoring.py           # Pencatatan & QA/QC observasi
│   │   └── visualizations.py      # Plotly generator & diagram
│   ├── pages/
│   │   ├── 1_🗺️_Peta_Gambut.py
│   │   ├── 2_📋_Penilaian_Gambut.py
│   │   ├── 3_🔍_Diagnosis_Lokasi.py
│   │   ├── 4_⚖️_Perbandingan_Tindakan.py
│   │   ├── 5_⚙️_Mesin_Optimasi.py
│   │   ├── 6_💰_Simulator_Anggaran.py
│   │   ├── 7_🌦️_Simulator_Skenario.py
│   │   ├── 8_📊_Monitoring.py
│   │   ├── 9_📖_Data_dan_Metodologi.py
│   │   └── 10_📑_Laporan_dan_Pengaturan.py
│   └── tests/
│       ├── test_optimization.py    # Test suite SciPy/Pandas
│       └── test_math_pure.py       # Test suite standard library
```
