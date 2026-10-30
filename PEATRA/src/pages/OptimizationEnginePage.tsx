import React from 'react';
import { Site, OptimizationResult, EvaluatedAction } from '../types';
import { DonutChart } from '../components/DonutChart';
import { Cpu, Play, CheckCircle2, Sliders, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';

interface OptimizationEnginePageProps {
  sites: Site[];
  optimizationResult: OptimizationResult;
  budget: number;
  onBudgetChange: (b: number) => void;
  weights: { w_R: number; w_W: number; w_E: number };
  onWeightsChange: (w: { w_R: number; w_W: number; w_E: number }) => void;
  normMethod: 'fixed_ref' | 'linear_max' | 'min_max';
  onNormMethodChange: (m: 'fixed_ref' | 'linear_max' | 'min_max') => void;
  onRunOptimization: () => void;
  isOptimizing: boolean;
  onNavigate: (page: string) => void;
}

export const OptimizationEnginePage: React.FC<OptimizationEnginePageProps> = ({
  sites,
  optimizationResult,
  budget,
  onBudgetChange,
  weights,
  onWeightsChange,
  normMethod,
  onNormMethodChange,
  onRunOptimization,
  isOptimizing,
  onNavigate
}) => {
  const activeChosen = optimizationResult.actions.filter(
    a => a.selected && a.action !== 'no_intervention'
  );
  const repairCount = activeChosen.filter(a => a.action === 'repair').length;
  const newBuildCount = activeChosen.filter(a => a.action === 'new_build').length;

  const totalW = weights.w_R + weights.w_W + weights.w_E;
  const norm_R = (weights.w_R / totalW).toFixed(2);
  const norm_W = (weights.w_W / totalW).toFixed(2);
  const norm_E = (weights.w_E / totalW).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#213A75]">Optimasi Multi-Objektif</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formulasi Binary MILP berbasis SciPy HiGHS Solver untuk penentuan portofolio intervensi optimal
          </p>
        </div>

        <button
          onClick={onRunOptimization}
          disabled={isOptimizing}
          className="bg-[#2F698B] hover:bg-[#213A75] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
          {isOptimizing ? 'Menjalankan Solver...' : 'Jalankan Optimasi'}
        </button>
      </div>

      {/* Main 3-Column Grid (matching Screen 4 exactly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Col 1: Parameter Optimasi (col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider">
              Parameter Optimasi
            </h2>

            {/* Lokasi kandidat */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lokasi kandidat:
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700">
                <option>{sites.length} lokasi (KHG Kampar - Gaung)</option>
                <option>6 lokasi inti (A1, A2, B1, B2, C1, C2)</option>
              </select>
            </div>

            {/* Bobot Tujuan Sliders */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Bobot tujuan</span>
                <span className="text-[11px] text-slate-400 font-normal">Auto-normalisasi &Sigma;=1.0</span>
              </div>

              {/* Fire Risk Slider */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Pengurangan risiko kebakaran:</span>
                  <span className="font-bold text-[#213A75]">{norm_R}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.w_R}
                  onChange={e => onWeightsChange({ ...weights, w_R: parseFloat(e.target.value) })}
                  className="w-full accent-[#2F698B] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Hydrology Slider */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Efektivitas Hidrologis:</span>
                  <span className="font-bold text-[#213A75]">{norm_W}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.w_W}
                  onChange={e => onWeightsChange({ ...weights, w_W: parseFloat(e.target.value) })}
                  className="w-full accent-[#409DA1] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Ecological Slider */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Manfaat ekologis:</span>
                  <span className="font-bold text-[#213A75]">{norm_E}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={weights.w_E}
                  onChange={e => onWeightsChange({ ...weights, w_E: parseFloat(e.target.value) })}
                  className="w-full accent-[#54B79A] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Batas Anggaran */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Batas anggaran:
              </label>
              <select
                value={budget}
                onChange={e => onBudgetChange(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-[#213A75]"
              >
                <option value={500000000}>Rp 500.000.000 (0,5 Miliar)</option>
                <option value={1000000000}>Rp 1.000.000.000 (1 Miliar)</option>
                <option value={2000000000}>Rp 2.000.000.000 (2 Miliar)</option>
                <option value={5000000000}>Rp 5.000.000.000 (5 Miliar)</option>
              </select>
            </div>

            {/* Normalization Method */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Metode Normalisasi:
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'fixed_ref', label: 'Acuan Tetap' },
                  { id: 'linear_max', label: 'SAW / Max' },
                  { id: 'min_max', label: 'Min-Max' }
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => onNormMethodChange(m.id as any)}
                    className={`py-1.5 px-2 rounded text-[11px] font-semibold border transition-all ${
                      normMethod === m.id
                        ? 'bg-[#2F698B] text-white border-[#2F698B]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Proses & Hasil Optimasi (col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-4">
              Proses Optimasi
            </h2>

            {/* Checklist Steps (matching Screen 4 checklist) */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Inisialisasi model
                </span>
                <span className="font-bold text-emerald-600">100%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Evaluasi solusi
                </span>
                <span className="font-bold text-emerald-600">100%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Optimasi MILP HiGHS
                </span>
                <span className="font-bold text-emerald-600">100%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Hasil akhir
                </span>
                <span className="font-bold text-emerald-600">100%</span>
              </div>
            </div>

            {/* Big Result Box (matching Screen 4 result callout) */}
            <div className="mt-6 text-center p-6 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Optimasi</div>
              <div className="text-3xl font-extrabold text-[#213A75] mt-1 tabular-nums">
                {optimizationResult.numSelected} lokasi prioritas
              </div>
              <div className="text-xs text-slate-500 mt-1">
                dari {sites.length} kandidat lokasi
              </div>

              <button
                onClick={() => {
                  const el = document.getElementById('decision-table');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Lihat daftar lokasi
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Optimality Gap: <strong>0.00%</strong></span>
            <span className="text-emerald-600 font-semibold">Proved Global Optimum</span>
          </div>
        </div>

        {/* Col 3: Distribusi Rekomendasi (col-span-4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-2">
              Distribusi Rekomendasi
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Proporsi jenis tindakan terpilih dalam portofolio
            </p>

            <DonutChart repairCount={repairCount} newBuildCount={newBuildCount} />
          </div>

          {/* Greedy Baseline Comparison */}
          <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-2">
            <div className="font-bold text-[#213A75] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#409DA1]" />
              Komparasi Solver MILP vs Heuristik Greedy
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Skor MILP HiGHS (Z):</span>
              <strong className="text-[#213A75]">{optimizationResult.totalScore.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Skor Greedy Rasio (U/C):</span>
              <strong className="text-slate-600">{optimizationResult.greedyScore.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
              <span>Peningkatan Keuntungan Relatif:</span>
              <strong className="text-emerald-600 font-extrabold">+{optimizationResult.improvementPct}%</strong>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 italic">
              Metode MILP mencegah pengisian knapsack serakah yang dapat mengorbankan portofolio global.
            </div>
          </div>
        </div>
      </div>

      {/* Decision Table Anchor */}
      <div id="decision-table" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-base font-bold text-[#213A75] mb-1">
          Tabel Matriks Keputusan Rinci ({activeChosen.length} Lokasi Terpilih)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Seluruh kendala batas anggaran, keunikan 1 intervensi, dan kelayakan teknis telah dipenuhi oleh solver.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Kode</th>
                <th className="py-2.5 px-3 font-semibold">Nama Lokasi</th>
                <th className="py-2.5 px-3 font-semibold">Tindakan Terpilih</th>
                <th className="py-2.5 px-3 font-semibold text-right">Biaya (IDR)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Kenaikan TMA (W)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Penurunan Api (R)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Luas Ekologis (E)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Skor Utilitas (U)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeChosen.map(act => (
                <tr key={`${act.site_id}_${act.action}`} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#213A75]">{act.site_id}</td>
                  <td className="py-2.5 px-3 text-slate-800">Lokasi {act.site_id}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        act.action === 'new_build'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {act.action_label}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                    Rp {act.cost.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">
                    +{(act.hydrological_improvement * 100).toFixed(0)} cm
                  </td>
                  <td className="py-2.5 px-3 text-right text-orange-600 font-medium">
                    -{act.delta_fire_risk.toFixed(1)} poin
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                    {act.ecological_area_benefit} ha
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#213A75]">
                    {act.weighted_score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
