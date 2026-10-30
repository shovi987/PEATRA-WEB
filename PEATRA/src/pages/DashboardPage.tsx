import React from 'react';
import { Site, EvaluatedAction, OptimizationResult } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';
import { DonutChart } from '../components/DonutChart';
import { Play, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, Layers, FileDown } from 'lucide-react';

interface DashboardPageProps {
  sites: Site[];
  optimizationResult: OptimizationResult;
  budget: number;
  onNavigate: (page: string) => void;
  onSelectSite: (siteId: string) => void;
  onRunOptimization: () => void;
  isOptimizing: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  sites,
  optimizationResult,
  budget,
  onNavigate,
  onSelectSite,
  onRunOptimization,
  isOptimizing
}) => {
  const activeChosen = optimizationResult.actions.filter(
    a => a.selected && a.action !== 'no_intervention'
  );
  const repairCount = activeChosen.filter(a => a.action === 'repair').length;
  const newBuildCount = activeChosen.filter(a => a.action === 'new_build').length;

  const selectedActionMap = new Map<string, string>();
  activeChosen.forEach(a => selectedActionMap.set(a.site_id, a.action));

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] px-4 py-2.5 rounded-xl text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold">Wilayah Pilot:</span>
          <span>KHG Sungai Kampar - Gaung, Kabupaten Pelalawan, Provinsi Riau</span>
          <span className="text-emerald-400">|</span>
          <span className="text-emerald-700 italic">Data demo berstatus ILLUSTRATIVE untuk simulasi optimasi restorasi gambut</span>
        </div>
        <button
          onClick={() => onNavigate('data_methodology')}
          className="underline font-semibold hover:text-emerald-900 transition-colors"
        >
          Lihat Metodologi &rarr;
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Luas KHG */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Luas Kawasan KHG</div>
          <div className="text-2xl font-extrabold text-[#213A75] mt-1 tabular-nums">791.374 ha</div>
          <div className="text-xs text-red-600 font-medium mt-1">312.922 ha (39,5%) Rusak</div>
        </div>

        {/* Card 2: Anggaran Tersedia */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Batas Anggaran</div>
          <div className="text-2xl font-extrabold text-[#213A75] mt-1 tabular-nums">
            Rp {(budget / 1e9).toFixed(2)} M
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Terpakai: Rp {(optimizationResult.totalCost / 1e9).toFixed(2)} M (
            {((optimizationResult.totalCost / budget) * 100).toFixed(0)}%)
          </div>
        </div>

        {/* Card 3: Lokasi Prioritas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Lokasi Ditangani (MILP)</div>
          <div className="text-2xl font-extrabold text-[#213A75] mt-1 tabular-nums">
            {optimizationResult.numSelected} Lokasi
          </div>
          <div className="text-xs text-[#409DA1] font-medium mt-1">
            {repairCount} Sekat Lama · {newBuildCount} Sekat Baru
          </div>
        </div>

        {/* Card 4: Total Skor Manfaat */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Skor Manfaat (Z)</div>
          <div className="text-2xl font-extrabold text-[#213A75] mt-1 tabular-nums">
            {optimizationResult.totalScore.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            +{optimizationResult.improvementPct}% vs Heuristik Greedy
          </div>
        </div>
      </div>

      {/* Main Grid: Spatial Overview & Optimization Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Preview */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#213A75]">Peta Sebaran Lahan & Rekomendasi Tindakan</h2>
              <p className="text-xs text-slate-500">Klik marker lokasi untuk melihat diagnosis rinci</p>
            </div>
            <button
              onClick={() => onNavigate('peatland_map')}
              className="text-xs font-semibold text-[#2F698B] hover:text-[#213A75] flex items-center gap-1 transition-colors"
            >
              Buka Peta Penuh <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <InteractiveMap
            sites={sites}
            onSelectSite={onSelectSite}
            height="380px"
            selectedActionMap={selectedActionMap}
          />

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F698B]"></span> Perbaikan sekat
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#409DA1]"></span> Sekat baru
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Tanpa intervensi
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Solver: SciPy HiGHS MILP</span>
          </div>
        </div>

        {/* Right: Optimization Snapshot & Donut */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#213A75]">Distribusi Portofolio Restorasi</h2>
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-md border border-emerald-200">
                Optimal
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Komposisi alokasi anggaran Rp {(budget / 1e9).toFixed(2)} Miliar terhadap jenis tindakan intervensi terbaik.
            </p>

            <DonutChart repairCount={repairCount} newBuildCount={newBuildCount} />
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1.5 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Anggaran Terpakai:</span>
                <span className="font-bold text-[#213A75]">Rp {optimizationResult.totalCost.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sisa Anggaran:</span>
                <span className="font-bold text-emerald-600">Rp {optimizationResult.remainingBudget.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Keuntungan Skor vs Greedy:</span>
                <span className="font-bold text-[#409DA1]">+{optimizationResult.improvementPct}% Efisiensi</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onRunOptimization}
                disabled={isOptimizing}
                className="w-full bg-[#2F698B] hover:bg-[#213A75] text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                {isOptimizing ? 'Mengoptimasi...' : 'Jalankan Optimasi'}
              </button>
              <button
                onClick={() => onNavigate('optimization_engine')}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3 rounded-lg text-xs font-semibold transition-colors"
              >
                Atur Parameter &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#213A75]">Daftar Keputusan Lokasi Terpilih (Portofolio MILP)</h3>
            <p className="text-xs text-slate-500">Intervensi dengan nilai utilitas multi-kriteria tertinggi dalam batas pagu anggaran</p>
          </div>
          <button
            onClick={() => onNavigate('reports_settings')}
            className="text-xs font-semibold text-[#2F698B] hover:underline flex items-center gap-1"
          >
            Unduh Hasil (CSV/JSON) <FileDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Kode</th>
                <th className="py-2.5 px-3 font-semibold">Nama Lokasi</th>
                <th className="py-2.5 px-3 font-semibold">Rekomendasi Tindakan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Biaya (IDR)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Kenaikan TMA</th>
                <th className="py-2.5 px-3 font-semibold text-right">Penurunan Risiko Api</th>
                <th className="py-2.5 px-3 font-semibold text-right">Skor Utilitas (U)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeChosen.map(act => (
                <tr key={`${act.site_id}_${act.action}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#213A75]">{act.site_id}</td>
                  <td className="py-2.5 px-3 text-slate-700">Lokasi {act.site_id}</td>
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
                  <td className="py-2.5 px-3 text-right font-medium text-emerald-600">
                    +{(act.hydrological_improvement * 100).toFixed(0)} cm
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-orange-600">
                    -{act.delta_fire_risk.toFixed(1)} poin
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#213A75]">
                    {act.weighted_score.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => {
                        onSelectSite(act.site_id);
                        onNavigate('site_diagnosis');
                      }}
                      className="text-xs font-semibold text-[#2F698B] hover:text-[#213A75] hover:underline"
                    >
                      Diagnosis
                    </button>
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
