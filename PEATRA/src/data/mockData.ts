import { Site, Intervention, MonitoringObservation } from '../types';

export const INITIAL_SITES: Site[] = [
  {
    site_id: 'A1',
    site_name: 'Lokasi A1 - Semak Kanal Utama',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2517,
    longitude: 101.8432,
    land_cover: 'Semak',
    canal_condition: 'Rusak sebagian',
    groundwater_depth: 0.78,
    fire_risk_index: 70,
    ecological_sensitivity: 65,
    affected_area: 120,
    accessibility: 'Sedang',
    data_provenance: 'Simulasi Ilustratif BRGM/Bappeda'
  },
  {
    site_id: 'A2',
    site_name: 'Lokasi A2 - Bekas Terbakar Blok B',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2645,
    longitude: 101.8590,
    land_cover: 'Bekas terbakar',
    canal_condition: 'Rusak berat',
    groundwater_depth: 0.94,
    fire_risk_index: 82,
    ecological_sensitivity: 80,
    affected_area: 210,
    accessibility: 'Baik',
    data_provenance: 'Simulasi Ilustratif BRGM/Bappeda'
  },
  {
    site_id: 'B1',
    site_name: 'Lokasi B1 - Hutan Sekunder Inti',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2389,
    longitude: 101.8315,
    land_cover: 'Hutan sekunder',
    canal_condition: 'Rusak sebagian',
    groundwater_depth: 0.58,
    fire_risk_index: 57,
    ecological_sensitivity: 90,
    affected_area: 180,
    accessibility: 'Sedang',
    data_provenance: 'Simulasi Ilustratif KLHK'
  },
  {
    site_id: 'B2',
    site_name: 'Lokasi B2 - Semak Pedalaman',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2780,
    longitude: 101.8724,
    land_cover: 'Semak',
    canal_condition: 'Tidak ada',
    groundwater_depth: 0.74,
    fire_risk_index: 76,
    ecological_sensitivity: 60,
    affected_area: 150,
    accessibility: 'Sulit',
    data_provenance: 'Simulasi Ilustratif Pemda'
  },
  {
    site_id: 'C1',
    site_name: 'Lokasi C1 - Hutan Sekunder Restorasi',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2210,
    longitude: 101.8150,
    land_cover: 'Hutan sekunder',
    canal_condition: 'Baik',
    groundwater_depth: 0.38,
    fire_risk_index: 34,
    ecological_sensitivity: 95,
    affected_area: 250,
    accessibility: 'Sedang',
    data_provenance: 'Simulasi Ilustratif Lapangan'
  },
  {
    site_id: 'C2',
    site_name: 'Lokasi C2 - Kebun Campuran Penyangga',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2890,
    longitude: 101.8410,
    land_cover: 'Kebun campuran',
    canal_condition: 'Rusak sebagian',
    groundwater_depth: 0.48,
    fire_risk_index: 52,
    ecological_sensitivity: 50,
    affected_area: 110,
    accessibility: 'Baik',
    data_provenance: 'Simulasi Ilustratif Masyarakat'
  },
  {
    site_id: 'D1',
    site_name: 'Lokasi D1 - Semak Terdegradasi Kanal Barat',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2450,
    longitude: 101.8210,
    land_cover: 'Semak',
    canal_condition: 'Rusak berat',
    groundwater_depth: 0.85,
    fire_risk_index: 78,
    ecological_sensitivity: 65,
    affected_area: 135,
    accessibility: 'Sedang',
    data_provenance: 'Simulasi Ilustratif BRGM'
  },
  {
    site_id: 'D2',
    site_name: 'Lokasi D2 - Bekas Terbakar Kanal Selatan',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2710,
    longitude: 101.8650,
    land_cover: 'Bekas terbakar',
    canal_condition: 'Tidak ada',
    groundwater_depth: 0.91,
    fire_risk_index: 85,
    ecological_sensitivity: 75,
    affected_area: 190,
    accessibility: 'Sulit',
    data_provenance: 'Simulasi Ilustratif Sentinel-2'
  },
  {
    site_id: 'E1',
    site_name: 'Lokasi E1 - Hutan Sekunder Rawa Gambut',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2150,
    longitude: 101.8350,
    land_cover: 'Hutan sekunder',
    canal_condition: 'Rusak sebagian',
    groundwater_depth: 0.52,
    fire_risk_index: 48,
    ecological_sensitivity: 88,
    affected_area: 160,
    accessibility: 'Baik',
    data_provenance: 'Simulasi Ilustratif KLHK'
  },
  {
    site_id: 'E2',
    site_name: 'Lokasi E2 - Kebun Karet Campuran Rakyat',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2950,
    longitude: 101.8250,
    land_cover: 'Kebun campuran',
    canal_condition: 'Rusak berat',
    groundwater_depth: 0.68,
    fire_risk_index: 64,
    ecological_sensitivity: 55,
    affected_area: 105,
    accessibility: 'Baik',
    data_provenance: 'Simulasi Ilustratif Bappeda'
  },
  {
    site_id: 'F1',
    site_name: 'Lokasi F1 - Semak Belukar Hulu Kanal',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2320,
    longitude: 101.8520,
    land_cover: 'Semak',
    canal_condition: 'Rusak sebagian',
    groundwater_depth: 0.72,
    fire_risk_index: 68,
    ecological_sensitivity: 62,
    affected_area: 115,
    accessibility: 'Sedang',
    data_provenance: 'Simulasi Ilustratif BRGM'
  },
  {
    site_id: 'F2',
    site_name: 'Lokasi F2 - Semak Dekat Permukiman',
    khg_name: 'KHG Sungai Kampar - Gaung',
    latitude: -0.2600,
    longitude: 101.8180,
    land_cover: 'Semak',
    canal_condition: 'Tidak ada',
    groundwater_depth: 0.65,
    fire_risk_index: 60,
    ecological_sensitivity: 58,
    affected_area: 95,
    accessibility: 'Baik',
    data_provenance: 'Simulasi Ilustratif Pemda'
  }
];

export const INITIAL_INTERVENTIONS: Intervention[] = [
  // A1
  { site_id: 'A1', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 350000000, delta_fire_risk: 28.0, hydrological_improvement: 0.12, ecological_area_benefit: 80, technical_feasibility: 1, confidence_level: 0.85 },
  { site_id: 'A1', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 600000000, delta_fire_risk: 45.5, hydrological_improvement: 0.18, ecological_area_benefit: 120, technical_feasibility: 1, confidence_level: 0.90 },
  { site_id: 'A1', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // A2
  { site_id: 'A2', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 420000000, delta_fire_risk: 32.0, hydrological_improvement: 0.14, ecological_area_benefit: 140, technical_feasibility: 1, confidence_level: 0.80 },
  { site_id: 'A2', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 680000000, delta_fire_risk: 53.3, hydrological_improvement: 0.22, ecological_area_benefit: 210, technical_feasibility: 1, confidence_level: 0.92 },
  { site_id: 'A2', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // B1
  { site_id: 'B1', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 300000000, delta_fire_risk: 23.0, hydrological_improvement: 0.10, ecological_area_benefit: 120, technical_feasibility: 1, confidence_level: 0.88 },
  { site_id: 'B1', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 550000000, delta_fire_risk: 37.0, hydrological_improvement: 0.16, ecological_area_benefit: 180, technical_feasibility: 1, confidence_level: 0.90 },
  { site_id: 'B1', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // B2 (no existing canal block -> repair is technically infeasible: 0)
  { site_id: 'B2', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 350000000, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 0, confidence_level: 0.00 },
  { site_id: 'B2', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 650000000, delta_fire_risk: 49.4, hydrological_improvement: 0.20, ecological_area_benefit: 150, technical_feasibility: 1, confidence_level: 0.85 },
  { site_id: 'B2', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // C1
  { site_id: 'C1', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 200000000, delta_fire_risk: 10.0, hydrological_improvement: 0.04, ecological_area_benefit: 150, technical_feasibility: 1, confidence_level: 0.95 },
  { site_id: 'C1', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 480000000, delta_fire_risk: 18.0, hydrological_improvement: 0.08, ecological_area_benefit: 250, technical_feasibility: 1, confidence_level: 0.90 },
  { site_id: 'C1', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // C2
  { site_id: 'C2', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 260000000, delta_fire_risk: 18.0, hydrological_improvement: 0.07, ecological_area_benefit: 70, technical_feasibility: 1, confidence_level: 0.85 },
  { site_id: 'C2', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 500000000, delta_fire_risk: 29.0, hydrological_improvement: 0.12, ecological_area_benefit: 110, technical_feasibility: 1, confidence_level: 0.90 },
  { site_id: 'C2', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // D1
  { site_id: 'D1', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 380000000, delta_fire_risk: 30.0, hydrological_improvement: 0.13, ecological_area_benefit: 90, technical_feasibility: 1, confidence_level: 0.82 },
  { site_id: 'D1', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 620000000, delta_fire_risk: 48.0, hydrological_improvement: 0.19, ecological_area_benefit: 135, technical_feasibility: 1, confidence_level: 0.89 },
  { site_id: 'D1', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // D2
  { site_id: 'D2', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 360000000, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 0, confidence_level: 0.00 },
  { site_id: 'D2', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 700000000, delta_fire_risk: 55.0, hydrological_improvement: 0.23, ecological_area_benefit: 190, technical_feasibility: 1, confidence_level: 0.87 },
  { site_id: 'D2', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // E1
  { site_id: 'E1', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 280000000, delta_fire_risk: 18.0, hydrological_improvement: 0.08, ecological_area_benefit: 110, technical_feasibility: 1, confidence_level: 0.88 },
  { site_id: 'E1', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 520000000, delta_fire_risk: 30.0, hydrological_improvement: 0.14, ecological_area_benefit: 160, technical_feasibility: 1, confidence_level: 0.91 },
  { site_id: 'E1', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // E2
  { site_id: 'E2', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 340000000, delta_fire_risk: 24.0, hydrological_improvement: 0.11, ecological_area_benefit: 75, technical_feasibility: 1, confidence_level: 0.84 },
  { site_id: 'E2', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 580000000, delta_fire_risk: 38.0, hydrological_improvement: 0.17, ecological_area_benefit: 105, technical_feasibility: 1, confidence_level: 0.88 },
  { site_id: 'E2', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // F1
  { site_id: 'F1', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 320000000, delta_fire_risk: 26.0, hydrological_improvement: 0.11, ecological_area_benefit: 80, technical_feasibility: 1, confidence_level: 0.86 },
  { site_id: 'F1', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 570000000, delta_fire_risk: 41.0, hydrological_improvement: 0.17, ecological_area_benefit: 115, technical_feasibility: 1, confidence_level: 0.90 },
  { site_id: 'F1', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 },
  // F2
  { site_id: 'F2', action: 'repair', action_label: 'Perbaikan Sekat Lama', cost: 310000000, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 0, confidence_level: 0.00 },
  { site_id: 'F2', action: 'new_build', action_label: 'Pembangunan Sekat Baru', cost: 540000000, delta_fire_risk: 35.0, hydrological_improvement: 0.15, ecological_area_benefit: 95, technical_feasibility: 1, confidence_level: 0.88 },
  { site_id: 'F2', action: 'no_intervention', action_label: 'Tanpa Intervensi', cost: 0, delta_fire_risk: 0.0, hydrological_improvement: 0.00, ecological_area_benefit: 0, technical_feasibility: 1, confidence_level: 1.00 }
];

export const INITIAL_MONITORING: MonitoringObservation[] = [
  { observation_id: 'OBS-001', site_id: 'A1', observation_date: '2025-06-15', groundwater_depth: 0.66, canal_condition: 'Rusak sebagian', fire_risk_index: 58, hotspot_count: 1, validation_status: 'Tervalidasi', notes: 'Pemantauan berkala pasca perbaikan darurat; elevasi air menunjukkan tren positif.' },
  { observation_id: 'OBS-002', site_id: 'A1', observation_date: '2025-09-10', groundwater_depth: 0.52, canal_condition: 'Baik', fire_risk_index: 42, hotspot_count: 0, validation_status: 'Tervalidasi', notes: 'Sekat berfungsi optimal setelah pemeliharaan; muka air naik +14 cm.' },
  { observation_id: 'OBS-003', site_id: 'A2', observation_date: '2025-08-20', groundwater_depth: 0.85, canal_condition: 'Rusak berat', fire_risk_index: 74, hotspot_count: 2, validation_status: 'Tervalidasi', notes: 'Sekat darurat tergerus debit air tinggi; butuh pembangunan sekat permanen.' },
  { observation_id: 'OBS-004', site_id: 'B1', observation_date: '2025-07-12', groundwater_depth: 0.48, canal_condition: 'Baik', fire_risk_index: 45, hotspot_count: 0, validation_status: 'Tervalidasi', notes: 'Vegetasi kanopi lebat menjaga kelembaban gambut inti secara stabil.' },
  { observation_id: 'OBS-005', site_id: 'B2', observation_date: '2025-09-02', groundwater_depth: 0.72, canal_condition: 'Tidak ada', fire_risk_index: 75, hotspot_count: 3, validation_status: 'Menunggu Validasi', notes: 'Laporan patroli MPA; akses kanal tertutup gulma tebal.' },
  { observation_id: 'OBS-006', site_id: 'C1', observation_date: '2025-06-25', groundwater_depth: 0.36, canal_condition: 'Baik', fire_risk_index: 30, hotspot_count: 0, validation_status: 'Tervalidasi', notes: 'Kondisi prima sesuai standar kepatuhan regulasi PP No. 57/2016.' }
];
