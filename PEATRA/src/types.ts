export interface Site {
  site_id: string;
  site_name: string;
  khg_name: string;
  latitude: number;
  longitude: number;
  land_cover: 'Semak' | 'Bekas terbakar' | 'Hutan sekunder' | 'Kebun campuran';
  canal_condition: 'Baik' | 'Rusak sebagian' | 'Rusak berat' | 'Tidak ada';
  groundwater_depth: number; // in meters (positive down)
  fire_risk_index: number; // 0 - 100
  ecological_sensitivity: number; // 0 - 100
  affected_area: number; // in hectares
  accessibility: 'Baik' | 'Sedang' | 'Sulit';
  data_provenance: string;
}

export type ActionType = 'repair' | 'new_build' | 'no_intervention';

export interface Intervention {
  site_id: string;
  action: ActionType;
  action_label: string;
  cost: number; // in IDR
  delta_fire_risk: number; // points
  hydrological_improvement: number; // in meters
  ecological_area_benefit: number; // in hectares
  technical_feasibility: 0 | 1;
  confidence_level: number; // 0.0 - 1.0
}

export interface MonitoringObservation {
  observation_id: string;
  site_id: string;
  observation_date: string;
  groundwater_depth: number;
  canal_condition: 'Baik' | 'Rusak sebagian' | 'Rusak berat' | 'Tidak ada';
  fire_risk_index: number;
  hotspot_count: number;
  validation_status: 'Tervalidasi' | 'Menunggu Validasi' | 'Ditolak';
  notes: string;
}

export interface EvaluatedAction extends Intervention {
  raw_delta_F: number;
  raw_G: number;
  raw_V: number;
  score_R: number;
  score_W: number;
  score_E: number;
  weighted_score: number;
  selected?: boolean;
}

export interface OptimizationResult {
  actions: EvaluatedAction[];
  totalScore: number;
  totalCost: number;
  remainingBudget: number;
  numSelected: number;
  status: string;
  isOptimal: boolean;
  greedyScore: number;
  greedyCost: number;
  greedyNumSelected: number;
  improvementPct: number;
}
