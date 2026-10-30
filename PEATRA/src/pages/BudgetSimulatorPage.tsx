import React from 'react';
import { Site, OptimizationResult, EvaluatedAction } from '../types';
import { Coins, TrendingUp, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';

interface BudgetSimulatorPageProps {
  sites: Site[];
  budget: number;
  onBudgetChange: (b: number) => void;
  optimizationResult: OptimizationResult;
  onSelectSite: (siteId: string) => void;
  onNavigate: (page: string) => void;
}

export const BudgetSimulatorPage: React.FC<BudgetSimulatorPageProps> = ({
  sites,
  budget,
  onBudgetChange,
  optimizationResult,
  onSelectSite,
  onNavigate
}) => {
  const activeChosen = optimizationResult.actions.filter(
    a => a.selected && a.action !== 'no_intervention'
  );
  const repairCount = activeChosen.filter(a => a.action === 'repair').length;
  const newBuildCount = activeChosen.filter(a => a.action === 'new_build').length;
  const totalCount = activeChosen.length;

  const repairPct = totalCount > 0 ? Math.round((repairCount / totalCount) * 100) : 0;
  const newBuildPct = totalCount > 0 ? Math.round((newBuildCount / totalCount) * 100) : 0;

  const avgWetting =
    totalCount > 0
      ? (activeChosen.reduce((acc, a) => acc + a.hydrological_improvement, 0) / totalCount) * 100
      : 0;

  const usedPct = budget > 0 ? Math.min(100, Math.round((optimizationResult.totalCost / budget) * 100)) : 0;

  const selectedActionMap = new Map<string, string>();
  activeChosen.forEach(a => selectedActionMap.set(a.site_id, a.action));

  // Compute curve points for budget simulation
  const steps = [300e6, 500e6, 800e6, 1e9, 1.5e9, 2e9, 2.5e9, 3e9];
  const maxScoreExpected = 320;

  return (
    <div className="space-y-6">
      {/* Top Header (matching Screen 5) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h1 className="text-2xl font-extrabold text-[#213A75]">Simulator Anggaran</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Eksplorasi dinamis korelasi besaran investasi terhadap jangkauan restorasi dan utilitas lanskap
        </p>
      </div>

      {/* Main Grid: Atur Anggaran, Ringkasan Hasil, Anggaran (matching Screen 5 exactly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Atur Anggaran & Presets (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-2">
              Atur Anggaran
            </h2>
            <div className="text-2xl font-extrabold text-[#213A75] mb-4 tabular-nums">
              Rp {budget.toLocaleString('id-ID')}
            </div>

            {/* Slider */}
            <input
              type="range"
              min="200000000"
              max="3000000000"
              step="50000000"
              value={budget}
              onChange={e => onBudgetChange(Number(e.target.value))}
              className="w-full accent-[#2F698B] h-2 bg-slate-200 rounded-lg cursor-pointer mb-5"
            />

            {/* Preset Buttons (matching Screen 5 presets) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onBudgetChange(500000000)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  budget === 500000000
                    ? 'bg-[#2F698B] text-white border-[#2F698B]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Rp 500 juta
              </button>
              <button
                onClick={() => onBudgetChange(1000000000)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  budget === 1000000000
                    ? 'bg-[#2F698B] text-white border-[#2F698B]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Rp 1 miliar
              </button>
              <button
                onClick={() => onBudgetChange(2000000000)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  budget === 2000000000
                    ? 'bg-[#2F698B] text-white border-[#2F698B]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Rp 2 miliar
              </button>
            </div>
          </div>

          {/* Mini Map of Selected Sites (matching Screen 5 bottom left map) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-xs font-bold text-[#213A75] mb-2 flex items-center justify-between">
              <span>Lokasi Terpilih</span>
              <span className="text-[11px] text-slate-400 font-normal">{totalCount} titik terpilih</span>
            </div>
            <InteractiveMap
              sites={sites}
              onSelectSite={onSelectSite}
              height="200px"
              selectedActionMap={selectedActionMap}
            />
            <div className="flex items-center gap-4 text-[10px] text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2F698B]"></span> Perbaikan sekat lama
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#409DA1]"></span> Pembangunan sekat baru
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Ringkasan Hasil & Anggaran Box (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Ringkasan Hasil (matching Screen 5 middle/right) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-2">
              Ringkasan Hasil
            </h2>
            <div className="text-xs text-slate-500 mb-4">Jumlah lokasi terpilih</div>
            <div className="text-4xl font-extrabold text-[#213A75] tabular-nums mb-5">
              {totalCount} lokasi
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2F698B]"></span>
                  Perbaikan sekat lama
                </span>
                <span className="font-bold text-[#213A75]">
                  {repairCount} ({repairPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#409DA1]"></span>
                  Pembangunan sekat baru
                </span>
                <span className="font-bold text-[#213A75]">
                  {newBuildCount} ({newBuildPct}%)
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2">
                <span className="text-slate-600 flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">&uarr;</span>
                  Estimasi manfaat pembasahan
                </span>
                <span className="font-bold text-emerald-600">
                  +{avgWetting.toFixed(0)} cm (rata-rata)
                </span>
              </div>
            </div>
          </div>

          {/* Anggaran Box (matching Screen 5 bottom right) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-4">
              Anggaran
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total anggaran:</span>
                <span className="font-bold text-slate-800 tabular-nums">
                  Rp {budget.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Terpakai:</span>
                <span className="font-extrabold text-[#213A75] tabular-nums text-sm">
                  Rp {optimizationResult.totalCost.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sisa:</span>
                <span className="font-bold text-emerald-600 tabular-nums text-sm">
                  Rp {optimizationResult.remainingBudget.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Progress Bar with Percentage Tag */}
              <div className="mt-4 pt-2">
                <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                  <span>Realisasi Penyerapan</span>
                  <span className="text-emerald-600 font-bold">{usedPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#2F698B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${usedPct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensitivity Curve Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#213A75] uppercase tracking-wider">
              Kurva Sensitivitas Anggaran vs Total Skor Objektif (Z)
            </h3>
            <p className="text-xs text-slate-500">
              Analisis titik jenuh (diminishing marginal utility) portofolio restorasi
            </p>
          </div>
          <span className="text-xs text-slate-400">MILP HiGHS vs Greedy Heuristik</span>
        </div>

        {/* SVG Sensitivity Curve Chart */}
        <div className="h-64 w-full relative pt-4">
          <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="50" y1="20" x2="680" y2="20" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="50" y1="60" x2="680" y2="60" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="50" y1="100" x2="680" y2="100" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="50" y1="140" x2="680" y2="140" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="50" y1="180" x2="680" y2="180" stroke="#E2E8F0" strokeWidth="1.5" />

            {/* Greedy line (dashed grey) */}
            <path
              d="M 50 170 Q 150 130 300 80 T 500 50 T 680 40"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* MILP curve (solid #213A75 with gradient area) */}
            <path
              d="M 50 160 Q 150 100 300 50 T 500 25 T 680 15"
              fill="none"
              stroke="#213A75"
              strokeWidth="3.5"
            />

            {/* Current Budget Marker */}
            {(() => {
              const markerX = 50 + ((budget - 200e6) / (3e9 - 200e6)) * 630;
              return (
                <g>
                  <line x1={markerX} y1="10" x2={markerX} y2="180" stroke="#409DA1" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx={markerX} cy="45" r="5" fill="#409DA1" stroke="#FFFFFF" strokeWidth="2" />
                </g>
              );
            })()}
          </svg>

          {/* Axes Labels */}
          <div className="flex justify-between text-[10px] text-slate-400 px-10 mt-1 font-mono">
            <span>Rp 0,2 M</span>
            <span>Rp 0,5 M</span>
            <span>Rp 1,0 M</span>
            <span>Rp 1,5 M</span>
            <span>Rp 2,0 M</span>
            <span>Rp 3,0 M</span>
          </div>
        </div>
      </div>
    </div>
  );
};
