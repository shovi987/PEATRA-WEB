import React from 'react';
import { Site, OptimizationResult } from '../types';
import { CloudSun, Flame, Droplets, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';

interface ScenarioSimulatorPageProps {
  sites: Site[];
  activeScenario: 'Normal' | 'Musim Kering' | 'Risiko Kebakaran Tinggi';
  onSelectScenario: (scen: 'Normal' | 'Musim Kering' | 'Risiko Kebakaran Tinggi') => void;
  optimizationResult: OptimizationResult;
  onSelectSite: (siteId: string) => void;
  onNavigate: (page: string) => void;
}

export const ScenarioSimulatorPage: React.FC<ScenarioSimulatorPageProps> = ({
  sites,
  activeScenario,
  onSelectScenario,
  optimizationResult,
  onSelectSite,
  onNavigate
}) => {
  const activeChosen = optimizationResult.actions.filter(
    a => a.selected && a.action !== 'no_intervention'
  );
  const selectedActionMap = new Map<string, string>();
  activeChosen.forEach(a => selectedActionMap.set(a.site_id, a.action));

  return (
    <div className="space-y-6">
      {/* Top Header (matching Screen 6) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h1 className="text-2xl font-extrabold text-[#213A75]">Perbandingan Skenario</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Simulasi ketahanan portofolio intervensi terhadap fluktuasi iklim ekstrem dan ancaman kebakaran gambut
        </p>
      </div>

      {/* Top 3 Scenario Selector Cards (matching Screen 6 top 3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scenario 1: Normal */}
        <button
          onClick={() => onSelectScenario('Normal')}
          className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeScenario === 'Normal'
              ? 'bg-[#F0FDFA] border-[#409DA1] ring-2 ring-[#409DA1]/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-extrabold text-[#213A75] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Normal
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Baseline</span>
          </div>
          <div className="text-xs text-slate-500">Kondisi saat ini</div>
        </button>

        {/* Scenario 2: Musim Kering */}
        <button
          onClick={() => onSelectScenario('Musim Kering')}
          className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeScenario === 'Musim Kering'
              ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-extrabold text-[#213A75] flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-amber-500" />
              Musim Kering
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              Tinggi
            </span>
          </div>
          <div className="text-xs text-slate-500">Penurunan TMA -0.10 s/d -0.30 m</div>
        </button>

        {/* Scenario 3: Risiko Kebakaran Tinggi */}
        <button
          onClick={() => onSelectScenario('Risiko Kebakaran Tinggi')}
          className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
            activeScenario === 'Risiko Kebakaran Tinggi'
              ? 'bg-red-50/50 border-red-400 ring-2 ring-red-400/20 shadow-xs'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-extrabold text-[#213A75] flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              Risiko Kebakaran Tinggi
            </span>
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
              Sangat tinggi
            </span>
          </div>
          <div className="text-xs text-slate-500">Faktor risiko semak & bekas terbakar &uarr;</div>
        </button>
      </div>

      {/* Main Grid: Perubahan Kondisi vs Peta Skenario (matching Screen 6 exactly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Perubahan Kondisi (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-4">
              Perubahan Kondisi
            </h2>

            <div className="space-y-4 text-xs">
              {/* Row 1: Tinggi muka air */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Tinggi muka air</span>
                <span className="font-extrabold text-slate-800 tabular-nums">
                  {activeScenario === 'Normal' ? (
                    '-0,42 m'
                  ) : (
                    <>
                      -0,42 m <span className="text-red-500 font-bold">&rarr; -0,78 m</span>
                    </>
                  )}
                </span>
              </div>

              {/* Row 2: Risiko kebakaran */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Risiko kebakaran</span>
                <span className="font-extrabold text-slate-800">
                  {activeScenario === 'Normal' ? (
                    'Tinggi'
                  ) : (
                    <>
                      Tinggi <span className="text-orange-600 font-bold">&rarr; Sangat tinggi</span>
                    </>
                  )}
                </span>
              </div>

              {/* Row 3: Lokasi prioritas */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Lokasi prioritas</span>
                <span className="font-extrabold text-slate-800 tabular-nums">
                  {activeScenario === 'Normal' ? (
                    `${optimizationResult.numSelected} lokasi`
                  ) : (
                    <>
                      24 <span className="text-[#2F698B] font-bold">&rarr; 38 lokasi</span>
                    </>
                  )}
                </span>
              </div>

              {/* Row 4: Rekomendasi tindakan */}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Rekomendasi tindakan</span>
                <span className="font-bold text-right text-slate-800">
                  {activeScenario === 'Normal' ? (
                    'Fokus perbaikan sekat lama'
                  ) : (
                    <>
                      Fokus perbaikan sekat <br />
                      <span className="text-emerald-600 font-bold">&rarr; Tambah sekat baru</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-[#213A75] mb-1">Catatan Asumsi Simulasi:</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Seluruh faktor pengali iklim (penurunan TMA -0.10 s/d -0.30 m dan pembobotan risiko api) bersifat ilustratif untuk uji ketahanan analitis sistem optimasi, bukan ramalan meteorologis BMKG.
            </p>
          </div>
        </div>

        {/* Right Column: Peta Skenario (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider">
                Peta Skenario
              </h2>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Lokasi prioritas
              </span>
            </div>

            <InteractiveMap
              sites={sites}
              onSelectSite={onSelectSite}
              height="340px"
              selectedActionMap={selectedActionMap}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Skenario aktif: <strong>{activeScenario}</strong>
            </span>
            <button
              onClick={() => onNavigate('optimization_engine')}
              className="text-xs font-bold text-[#2F698B] hover:underline"
            >
              Jalankan optimasi ulang &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Regret Analysis Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-base font-bold text-[#213A75] mb-1">
          Matriks Penyesalan (Minimax Regret Decision Matrix)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Mengukur opportunity loss (skor yang hilang) jika portofolio yang dirancang untuk satu kondisi iklim dihadapkan pada realitas kondisi lainnya.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Strategi Portofolio</th>
                <th className="py-2.5 px-3 font-semibold text-right">Jika Realitas Normal</th>
                <th className="py-2.5 px-3 font-semibold text-right">Jika Realitas Kemarau</th>
                <th className="py-2.5 px-3 font-semibold text-right">Jika Realitas Api Tinggi</th>
                <th className="py-2.5 px-3 font-semibold text-right font-bold text-[#213A75]">
                  Maksimum Penyesalan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-sans font-bold text-slate-800">Portofolio Desain Normal</td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">0.0</td>
                <td className="py-2.5 px-3 text-right text-red-600">12.4</td>
                <td className="py-2.5 px-3 text-right text-red-600">15.6</td>
                <td className="py-2.5 px-3 text-right font-bold text-red-700">15.6</td>
              </tr>
              <tr className="hover:bg-slate-50 bg-emerald-50/30">
                <td className="py-2.5 px-3 font-sans font-bold text-emerald-950 flex items-center gap-1.5">
                  Portofolio Desain Musim Kering (Minimax Optimum)
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </td>
                <td className="py-2.5 px-3 text-right text-slate-600">4.2</td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">0.0</td>
                <td className="py-2.5 px-3 text-right text-slate-600">2.8</td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-700">4.2 (Terendah)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-sans font-bold text-slate-800">Portofolio Desain Api Tinggi</td>
                <td className="py-2.5 px-3 text-right text-slate-600">5.8</td>
                <td className="py-2.5 px-3 text-right text-slate-600">3.1</td>
                <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">0.0</td>
                <td className="py-2.5 px-3 text-right font-bold text-orange-600">5.8</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
