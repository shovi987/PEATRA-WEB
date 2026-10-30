# MASTER PROJECT BRIEF
# PEATRA — Adaptive Multi-Objective Peatland Restoration Optimizer

## 1. PROJECT OBJECTIVE

Bangun aplikasi web interaktif bernama **PEATRA (Adaptive Multi-Objective Peatland Restoration Optimizer)**.

PEATRA merupakan sistem pendukung keputusan berbasis optimasi matematis untuk membantu menentukan prioritas lokasi dan jenis intervensi restorasi gambut dengan mempertimbangkan keterbatasan anggaran, risiko kebakaran, kondisi hidrologis, dan manfaat ekologis.

**Tujuan utama: menghasilkan aplikasi yang benar-benar berfungsi, dapat dijalankan, dan siap dipublikasikan melalui GitHub dan Streamlit Community Cloud.**

Jangan berhenti pada rancangan, prototype statis, atau penjelasan arsitektur. Buat seluruh source code dan file pendukung sampai aplikasi bisa dijalankan.

## 2. KONSEP DAN RUANG LINGKUP

Lokasi pilot: Kabupaten Pelalawan, Provinsi Riau.

PEATRA membantu pengguna:
1. Mengidentifikasi kondisi dan tingkat risiko lahan gambut.
2. Menentukan lokasi yang membutuhkan restorasi.
3. Membandingkan perbaikan sekat kanal yang sudah ada dengan pembangunan sekat kanal baru.
4. Memilih kombinasi intervensi terbaik berdasarkan anggaran.
5. Menguji perubahan keputusan melalui simulasi anggaran dan skenario lingkungan.
6. Memantau perubahan kondisi lokasi dan melakukan optimasi ulang.

Tiga alternatif keputusan untuk setiap lokasi:
- Repair Existing Canal Block: memperbaiki sekat kanal yang sudah ada.
- New Canal Block Construction: membangun sekat kanal baru.
- No Intervention: tidak melakukan intervensi pada siklus perencanaan tersebut.

Sistem harus mempertimbangkan bahwa tindakan yang paling menguntungkan pada satu lokasi belum tentu menghasilkan portofolio terbaik ketika seluruh lokasi dan keterbatasan anggaran diperhitungkan.

## 3. TEKNOLOGI

Gunakan:
- Python sebagai bahasa pemrograman.
- Streamlit sebagai framework aplikasi.
- SciPy `scipy.optimize.milp` dengan solver HiGHS untuk optimasi MILP.
- Pandas dan NumPy untuk pengolahan data.
- Plotly untuk grafik interaktif.
- Folium atau PyDeck untuk visualisasi peta jika memungkinkan.
- Streamlit components untuk interaksi tambahan jika diperlukan.

Hindari dependensi yang tidak diperlukan dan API berbayar. Aplikasi harus tetap dapat dijalankan dengan dataset demo tanpa API key.

Target deployment: GitHub repository → Streamlit Community Cloud.

## 4. MATHEMATICAL MODEL

Bagian ini merupakan inti inovasi PEATRA. Implementasikan perhitungan secara konsisten dan dapat diperiksa.

### A. Indikator manfaat

Gunakan tiga kriteria:

**1. Fire-Risk Reduction (R)**

Mengukur penurunan indeks risiko kebakaran akibat suatu intervensi.

ΔF_ia = max(0, F_i - F_ia)

Keterangan:
- F_i: indeks risiko kebakaran awal lokasi i.
- F_ia: indeks risiko setelah tindakan a.
- Indeks berada pada skala 0–100 dan bukan probabilitas kebakaran.

**2. Hydrological Improvement (W)**

Mengukur perbaikan kondisi muka air tanah.

D_i = max(0, d_i - d_target)

G_ia = min(max(0, Δh_ia), D_i)

Keterangan:
- d_i: kedalaman muka air tanah awal dalam meter, bernilai positif ke bawah permukaan.
- d_target: ambang kedalaman acuan.
- Δh_ia: estimasi kenaikan muka air akibat intervensi.
- G_ia: perbaikan hidrologis yang diperhitungkan.

Gunakan 0,40 meter sebagai nilai acuan awal yang dapat dikonfigurasi. Cantumkan dasar regulasi dan batas penerapannya secara hati-hati; jangan menyatakan semua fungsi gambut memiliki ketentuan yang sama tanpa verifikasi.

**3. Ecological Benefit (E)**

V_ia = (s_i / 100) × A_ia

Keterangan:
- s_i: sensitivitas ekologis lokasi, skala 0–100.
- A_ia: luas habitat terdampak atau memperoleh manfaat dari tindakan, dalam hektare.
- V_ia: luas habitat ekuivalen yang telah mempertimbangkan sensitivitas ekologis.

### B. Normalisasi indikator

Ubah ketiga indikator menjadi skor 0–100 menggunakan skala acuan tetap:

S(v) = 100 × min(1, max(0, v / v_ref))

Nilai acuan:
- ΔF_ref = 40 poin.
- G_ref = 0,60 meter.
- V_ref = 200 hektare ekuivalen.

Dengan demikian:

R_ia = S(ΔF_ia)

W_ia = S(G_ia)

E_ia = S(V_ia)

Gunakan normalisasi acuan tetap sebagai metode default agar skor dapat dibandingkan antarlokasi, antarskenario, dan antarsiklus monitoring.

Sediakan metode normalisasi alternatif:
- Linear-max / SAW.
- Min-max.

Tampilkan metode yang sedang digunakan dan jelaskan bahwa min-max dapat mengubah hasil pemeringkatan dan portofolio optimal.

### C. Weighted Multi-Criteria Score

U_ia = w_R R_ia + w_W W_ia + w_E E_ia

Dengan:
- w_R ≥ 0
- w_W ≥ 0
- w_E ≥ 0
- w_R + w_W + w_E = 1

Pengguna dapat mengubah bobot melalui slider. Normalisasi bobot harus dilakukan otomatis dan bobot aktual yang digunakan solver harus selalu ditampilkan.

Bobot awal dapat menggunakan:
- Fire risk: 0,40.
- Hydrology: 0,35.
- Ecology: 0,25.

Bobot merupakan preferensi pengambil keputusan, bukan parameter ilmiah universal.

### D. Binary Mixed-Integer Linear Programming

Gunakan variabel keputusan:

x_ia = 1 jika intervensi a dipilih pada lokasi i, dan 0 jika tidak.

Fungsi objektif:

Maximize:

Z = Σ_i Σ_a U_ia × x_ia

Kendala:

1. Budget constraint:

Σ_i Σ_a C_ia × x_ia ≤ B

2. At most one intervention per site:

Σ_a x_ia ≤ 1, untuk setiap lokasi i.

3. Technical feasibility:

x_ia ≤ q_ia

q_ia = 1 jika intervensi layak secara teknis dan 0 jika tidak.

4. Binary constraint:

x_ia ∈ {0,1}

No Intervention direpresentasikan sebagai tidak memilih tindakan apa pun pada lokasi tersebut. Dengan demikian, lokasi tidak harus menerima intervensi jika tidak menguntungkan atau tidak sesuai anggaran.

Tambahkan kendala opsional:
- Maksimum jumlah intervensi.
- Lokasi wajib ditangani.
- Larangan tindakan tertentu.
- Batas anggaran khusus atau batas jumlah tindakan jika diperlukan.

Semua kendala opsional harus dapat diaktifkan pengguna dan benar-benar memengaruhi model optimasi.

### E. Solver dan validasi

Gunakan `scipy.optimize.milp` berbasis HiGHS.

Ketentuan:
- Jangan mengganti MILP dengan pengurutan skor atau greedy.
- Tampilkan status solver secara akurat.
- Bedakan optimal, feasible tetapi belum terbukti optimal, infeasible, dan error.
- Validasi kembali seluruh kendala setelah solver memberikan hasil.
- Hitung total biaya menggunakan data biaya asli dalam rupiah.
- Jangan membulatkan skor sebelum proses optimasi.
- Tampilkan optimality gap jika tersedia.
- Pastikan hasil tidak melampaui anggaran.

Jika terdapat beberapa solusi dengan skor optimal yang sama, gunakan biaya total terendah sebagai pemecah seri dengan optimasi dua tahap.

### F. Greedy baseline

Sediakan pembanding berupa algoritma greedy berdasarkan rasio:

U_ia / C_ia

Pilih tindakan dengan rasio tertinggi selama anggaran, kelayakan teknis, dan aturan satu tindakan per lokasi terpenuhi.

Tangani biaya nol secara eksplisit.

Bandingkan:
- Total skor MILP.
- Total skor greedy.
- Total biaya.
- Sisa anggaran.
- Selisih skor relatif.

Peningkatan:

Improvement (%) = ((Z_MILP - Z_greedy) / Z_greedy) × 100%

Jika Z_greedy = 0, tampilkan N/A.

Tegaskan bahwa skor merupakan manfaat model, bukan pengukuran langsung dampak ekologis aktual.

## 5. ANALISIS DAN SIMULASI

### A. Budget Simulation

Pengguna dapat mengubah anggaran melalui slider atau preset.

Setiap perubahan anggaran harus menjalankan ulang optimasi dan menampilkan:
- Portofolio intervensi optimal.
- Total skor.
- Total biaya.
- Sisa anggaran.
- Jumlah lokasi yang ditangani.
- Kurva hubungan anggaran dan total skor.
- Perbandingan MILP dengan greedy.

### B. Environmental Scenario Simulation

Sediakan tiga skenario:

1. Normal Condition.
2. Dry Season.
3. Elevated Fire Risk.

Kemarau:
- Penurunan muka air tanah: 0,10 meter pada sekat baik sampai 0,30 meter pada kondisi tanpa sekat atau rusak berat.
- Indeks risiko kebakaran ×1,25.
- Efektivitas sekat ×1,30.

Risiko kebakaran tinggi:
- Bekas terbakar: faktor 1,40.
- Semak: faktor 1,30.
- Kebun: faktor 1,15.
- Hutan: faktor 1,05.

Semua faktor merupakan asumsi simulasi ilustratif, bukan prediksi ilmiah.

Bobot preferensi pengguna dan asumsi perubahan lingkungan harus dikontrol secara terpisah.

Tampilkan perubahan:
- Skor setiap lokasi.
- Lokasi prioritas.
- Intervensi terpilih.
- Total biaya dan manfaat.
- Perbedaan portofolio antarskenario.

### C. Sensitivity Analysis

Implementasikan:
- Kurva anggaran versus skor optimal.
- Perubahan bobot kriteria.
- Uji biaya ±10% dan ±20%.
- Monte Carlo berdasarkan tingkat ketidakpastian data.
- Matriks regret antarskenario.

Monte Carlo harus menggunakan distribusi dan asumsi yang dijelaskan. Tampilkan frekuensi terpilihnya setiap intervensi dan interpretasikan sebagai stabilitas keputusan dalam simulasi, bukan probabilitas keberhasilan restorasi.

Matriks regret harus dihitung berdasarkan selisih manfaat setiap portofolio terhadap solusi optimal pada skenario yang bersangkutan.

## 6. MONITORING DAN FEEDBACK

Buat fitur pencatatan monitoring:
- Tanggal observasi.
- Lokasi.
- Kedalaman muka air tanah.
- Kondisi sekat kanal.
- Indeks risiko kebakaran.
- Jumlah titik panas sebagai informasi monitoring.
- Status validasi.
- Catatan petugas.

Hanya observasi berstatus tervalidasi yang boleh memperbarui data aktif dan memengaruhi hasil optimasi.

Aturan pembaruan:
- Muka air tanah memperbarui d_i.
- Kondisi sekat memperbarui kelayakan tindakan perbaikan.
- Indeks risiko memperbarui F_i jika metode pengukurannya tercatat.
- Jumlah titik panas hanya menjadi informasi monitoring, bukan langsung menggantikan indeks risiko.

Sediakan:
- Riwayat monitoring.
- Grafik sebelum dan sesudah.
- Log audit perubahan.
- Tombol optimasi ulang.

Jangan menyatakan perubahan kondisi disebabkan intervensi hanya berdasarkan perbandingan sebelum-sesudah.

## 7. COMPLETE APPLICATION PAGES

Buat seluruh halaman berikut dan pastikan navigasinya berfungsi.

### 1. Dashboard
- KPI total lokasi, luas gambut, anggaran, lokasi prioritas, dan progres monitoring.
- Peta mini.
- Distribusi intervensi.
- Ringkasan hasil optimasi terakhir.
- Grafik risiko dan kondisi gambut.
- Aktivitas monitoring terbaru.
- Tombol Run Optimization.

### 2. Peatland Map
- Peta interaktif dengan marker lokasi.
- Layer risiko kebakaran, kondisi hidrologis, tutupan lahan, dan rekomendasi tindakan.
- Filter, search, zoom, dan detail lokasi.
- Legenda yang jelas.
- Tabel lokasi yang tersinkron dengan peta.

Jika data koordinat resmi tidak tersedia, tampilkan peta skematis dan beri label bukan peta geografis resmi. Jangan membuat koordinat atau batas KHG palsu.

### 3. Peatland Assessment
- Kondisi setiap lokasi.
- Tutupan lahan.
- Kedalaman muka air tanah.
- Indeks risiko kebakaran.
- Kondisi sekat kanal.
- Sensitivitas ekologis.
- Aksesibilitas.
- Klasifikasi kondisi dan prioritas.

### 4. Site Diagnosis
- Detail lokasi.
- Indikator kondisi awal.
- Masalah utama.
- Kebutuhan restorasi.
- Kelayakan teknis.
- Sumber dan kualitas data.

### 5. Intervention Comparison
- Perbandingan repair, new construction, dan no intervention.
- Biaya.
- Kelayakan.
- Fire-risk reduction.
- Hydrological improvement.
- Ecological benefit.
- Weighted score.
- Penjelasan keputusan lokal versus portofolio global.

### 6. Optimization Engine
- Pengaturan anggaran.
- Slider bobot kriteria.
- Kendala tambahan.
- Tombol Run Optimization.
- Status solver.
- KPI hasil.
- Tabel keputusan.
- Peta hasil.
- Greedy comparison.
- Penjelasan keputusan.
- Verifikasi kendala dan hasil solver.

### 7. Budget Simulator
- Slider anggaran.
- Preset anggaran.
- Kurva anggaran dan manfaat.
- Perubahan lokasi terpilih.
- Perbandingan MILP dan greedy.

### 8. Scenario Simulator
- Normal, dry season, elevated fire risk.
- Perbandingan peta.
- Perubahan risiko dan hidrologi.
- Portofolio setiap skenario.
- Sensitivity dan regret analysis.

### 9. Monitoring
- Form input observasi.
- Validasi data.
- Riwayat dan grafik.
- Audit log.
- Re-optimization.

### 10. Data & Methodology
- Dataset.
- Data provenance.
- Formula dan normalisasi.
- Penjelasan MILP.
- Algoritma solver.
- Asumsi skenario.
- Referensi metodologi.
- Keterbatasan model.

### 11. Reports & Settings
- Laporan hasil optimasi.
- Laporan per lokasi.
- Ringkasan skenario.
- Ekspor CSV dan JSON.
- Laporan HTML/PDF siap cetak.
- Pengaturan aplikasi dan data.
- Reset demo data.

## 8. DATASET

Siapkan dataset demo yang konsisten dan cukup beragam untuk menunjukkan seluruh fungsi optimasi.

Gunakan struktur data:

**Sites**
- site_id
- site_name
- land_cover
- canal_condition
- groundwater_depth
- fire_risk_index
- ecological_sensitivity
- affected_area
- accessibility
- data_provenance

**Interventions**
- site_id
- action
- cost
- delta_fire_risk
- hydrological_improvement
- ecological_area_benefit
- technical_feasibility
- confidence_level

**Monitoring**
- observation_id
- site_id
- observation_date
- groundwater_depth
- canal_condition
- fire_risk_index
- hotspot_count
- validation_status
- notes

**Geometry**
- site_id
- schematic_geometry

Dataset harus bisa diubah melalui aplikasi dan tersedia sebagai file CSV.

Gunakan enam lokasi demo awal: A1, A2, B1, B2, C1, dan C2, dengan kondisi sesuai tabel berikut:

| Lokasi | Tutupan | Kondisi sekat | Kedalaman muka air tanah | Indeks risiko |
| A1 | Semak | Rusak sebagian | 0,78 m | 70 |
| A2 | Bekas terbakar | Rusak berat | 0,94 m | 82 |
| B1 | Hutan sekunder | Rusak sebagian | 0,58 m | 57 |
| B2 | Semak, akses sulit | Tidak ada | 0,74 m | 76 |
| C1 | Hutan sekunder | Baik | 0,38 m | 34 |
| C2 | Kebun campuran | Rusak sebagian | 0,48 m | 52 |

Seluruh data demo harus diberi label ILLUSTRATIVE. Jangan mengklaimnya sebagai hasil survei lapangan.

Buat data intervensi yang memungkinkan aplikasi menunjukkan trade-off nyata antara biaya, skor manfaat, dan keterbatasan anggaran.

## 9. UI/UX DAN IDENTITAS VISUAL

Desain harus mengikuti gaya professional environmental decision-support dashboard, bukan template dashboard generik.

**Official PEATRA Color Palette:**

| Warna | Hex | Penggunaan |
| Green | #84E488 | Aksen dan indikator positif |
| Green | #6BCE90 | Progress dan visualisasi |
| Teal | #54B79A | Grafik dan aksen |
| Teal | #409DA1 | Navigasi aktif dan elemen interaktif |
| Blue | #2F698B | Tombol utama dan grafik |
| Navy | #213A75 | Heading dan identitas utama |

Background utama: #F7FAF8.

Gunakan:
- Sidebar kiri dengan logo PEATRA dan 11 menu navigasi.
- Topbar dengan judul halaman, wilayah pilot, status data, dan informasi pembaruan.
- Banner yang selalu menunjukkan bahwa dataset demo bersifat ilustratif.
- KPI cards dengan ikon sederhana.
- White cards dengan border tipis dan radius konsisten.
- Grafik interaktif yang bersih.
- Tabel dengan pencarian dan filter.
- Peta yang menjadi elemen penting dashboard.
- Typography profesional dan mudah dibaca.
- Layout responsif untuk laptop dan desktop.

Hindari:
- Terlalu banyak gradient.
- Warna di luar identitas utama tanpa kebutuhan.
- Tampilan yang terlalu ramai.
- Emoji berlebihan.
- Elemen dekoratif yang tidak memiliki fungsi.
- Halaman yang terlihat seperti hasil generate template tanpa konsistensi.

Setiap halaman harus memiliki hierarki visual dan komposisi yang jelas. Dashboard utama harus langsung memperlihatkan kondisi gambut, risiko, dan hasil keputusan optimasi.

## 10. DATA INTEGRITY DAN TESTING

Aplikasi harus memenuhi ketentuan:

1. Semua perhitungan dilakukan melalui fungsi Python, bukan angka yang diketik manual untuk tampilan.
2. Seluruh KPI, grafik, peta, dan tabel membaca hasil dari sumber data dan state yang konsisten.
3. Perubahan bobot, anggaran, data lokasi, dan skenario benar-benar menjalankan ulang model.
4. Tidak boleh ada intervensi yang dipilih jika tidak layak secara teknis.
5. Tidak boleh ada biaya total melebihi anggaran.
6. Maksimal satu intervensi dipilih untuk setiap lokasi.
7. Uji kasus anggaran nol, biaya nol, data kosong, lokasi tidak layak, dan model infeasible.
8. Bandingkan hasil MILP dengan brute-force enumeration untuk dataset kecil.
9. Buat pengujian unit untuk fungsi normalisasi, skoring, validasi, dan optimasi.
10. Tampilkan error secara informatif dan jangan mengklaim solver optimal jika statusnya belum membuktikan optimalitas.

Semua data ilustratif dan hasil simulasi harus diberi penanda yang jelas.

## 11. OUTPUT FILE DAN DEPLOYMENT

Buat project lengkap dengan struktur yang rapi, minimal:

PEATRA/
- app.py
- requirements.txt
- README.md
- data/
  - sites.csv
  - interventions.csv
  - monitoring.csv
- modules/
  - data_manager.py
  - scoring.py
  - optimization.py
  - scenarios.py
  - sensitivity.py
  - monitoring.py
  - visualizations.py
- pages/
  - seluruh halaman Streamlit jika menggunakan multipage architecture
- assets/
  - logo dan aset visual

Boleh menyesuaikan struktur selama modular, mudah dipahami, dan seluruh file yang dibutuhkan tersedia.

README harus menjelaskan:
1. Cara menjalankan aplikasi di komputer.
2. Cara memasang dependencies.
3. Cara menguji aplikasi.
4. Cara membuat repository GitHub.
5. Cara menghubungkan repository dengan Streamlit Community Cloud.
6. Cara melakukan deployment dan memperbarui aplikasi.

## 12. FINAL EXECUTION INSTRUCTIONS

Langsung implementasikan aplikasi lengkap. Jangan menghabiskan waktu untuk mengulang brief atau membuat dokumen rancangan tambahan.

Prioritas pengerjaan:
1. Pastikan dataset dan fungsi matematis benar.
2. Implementasikan MILP dan validasi hasil.
3. Bangun seluruh 11 halaman.
4. Hubungkan seluruh fitur dengan data dan state yang sama.
5. Uji interaksi dan alur utama aplikasi.
6. Siapkan seluruh file agar siap dijalankan dan di-deploy.

Jika output terlalu besar untuk satu respons, buat file secara bertahap tetapi pertahankan project yang sama. Jangan menghapus atau menimpa pekerjaan yang sudah selesai.

Jika ada fitur yang tidak dapat diwujudkan secara penuh, buat versi fungsional yang realistis dan jelaskan keterbatasannya.

**JANGAN BERHENTI PADA TAHAP PERENCANAAN. OUTPUT WAJIB BERUPA SOURCE CODE APLIKASI PEATRA YANG LENGKAP, FUNGSIONAL, DAN SIAP DIJALANKAN MELALUI STREAMLIT SERTA DI-DEPLOY DARI GITHUB.**