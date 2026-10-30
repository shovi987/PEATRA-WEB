import React, { useState } from 'react';
import { Site } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';
import { ChevronDown, Layers, MapPin, Flame, Droplets, ShieldAlert } from 'lucide-react';

interface PeatlandMapPageProps {
  sites: Site[];
  onSelectSite: (siteId: string) => void;
  onNavigate: (page: string) => void;
}

export const PeatlandMapPage: React.FC<PeatlandMapPageProps> = ({
  sites,
  onSelectSite,
  onNavigate
}) => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'canal' | 'tma' | 'fire'>('all');
  const [selectedKhg, setSelectedKhg] = useState('KHG Sungai Kampar - Gaung');
  const [timeFilter, setTimeFilter] = useState('Terakhir 5 tahun');

  // Dynamic statistics calculated per selected landscape & time period
  const khgStats = React.useMemo(() => {
    if (selectedKhg.includes('Siak')) {
      const hp = timeFilter.includes('2026') ? 6 : timeFilter.includes('3') ? 20 : 34;
      return {
        luasGambut: '673.810 ha',
        luasRusak: '248.150 ha',
        rusakPct: '36,8%',
        hotspots: `${hp} titik`,
        sekat: '28 unit'
      };
    } else if (selectedKhg.includes('Rokan')) {
      const hp = timeFilter.includes('2026') ? 14 : timeFilter.includes('3') ? 41 : 62;
      return {
        luasGambut: '412.560 ha',
        luasRusak: '189.400 ha',
        rusakPct: '45,9%',
        hotspots: `${hp} titik`,
        sekat: '19 unit'
      };
    } else {
      const hp = timeFilter.includes('2026') ? 8 : timeFilter.includes('3') ? 28 : 48;
      return {
        luasGambut: '791.374 ha',
        luasRusak: '312.922 ha',
        rusakPct: '39,5%',
        hotspots: `${hp} titik`,
        sekat: '32 unit'
      };
    }
  }, [selectedKhg, timeFilter]);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar (matching Screen 1) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-[#213A75]">Peta Kondisi Gambut</h1>
          <p className="text-xs text-slate-500">Pemetaan sebaran spasial bio-fisik, hidrologi, dan infrastruktur restorasi</p>
        </div>

        <div className="flex items-center gap-3">
          {/* KHG Dropdown */}
          <div className="relative">
            <select
              value={selectedKhg}
              onChange={e => setSelectedKhg(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#409DA1]"
            >
              <option value="KHG Sungai Kampar - Gaung">KHG Sungai Kampar - Gaung</option>
              <option value="KHG Siak - Kampar">KHG Siak - Kampar (Ekspansi)</option>
              <option value="KHG Rokan Hilir">KHG Rokan Hilir (Ekspansi)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time Filter */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#409DA1]"
            >
              <option value="Terakhir 5 tahun">Terakhir 5 tahun</option>
              <option value="Terakhir 3 tahun">Terakhir 3 tahun</option>
              <option value="Tahun berjalan (2026)">Tahun berjalan (2026)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Map Viewport with Floating Overlay (matching Screen 1 layout) */}
      <div className="relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          {/* Map Canvas (col-span-9) */}
          <div className="lg:col-span-9 relative flex flex-col">
            <InteractiveMap
              sites={sites}
              onSelectSite={id => {
                onSelectSite(id);
                onNavigate('site_diagnosis');
              }}
              activeLayer={activeLayer}
              height="580px"
              khgName={selectedKhg}
              timeFilter={timeFilter}
            />

            {/* Bottom Layer Selector Strip (matching Screen 1 bottom tabs) */}
            <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveLayer('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeLayer === 'all'
                    ? 'bg-[#2F698B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Layer
              </button>
              <button
                onClick={() => setActiveLayer('canal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeLayer === 'canal'
                    ? 'bg-[#2F698B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Kondisi Sekat Kanal
              </button>
              <button
                onClick={() => setActiveLayer('tma')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeLayer === 'tma'
                    ? 'bg-[#2F698B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Droplets className="w-3 h-3 text-cyan-500" />
                Tinggi Muka Air
              </button>
              <button
                onClick={() => setActiveLayer('fire')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeLayer === 'fire'
                    ? 'bg-[#2F698B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Flame className="w-3 h-3 text-red-500" />
                Titik Panas
              </button>
            </div>
          </div>

          {/* Right Information & Legend Panel (matching Screen 1 right sidebar) */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 bg-slate-50/60 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-3">
                Ringkasan KHG
              </h2>

              <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div>
                  <div className="text-[11px] text-slate-500">Luas gambut</div>
                  <div className="text-xl font-extrabold text-[#213A75] tabular-nums mt-0.5">{khgStats.luasGambut}</div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">Luas rusak ringan-berat</div>
                  <div className="text-xl font-extrabold text-red-600 tabular-nums mt-0.5">
                    {khgStats.luasRusak} <span className="text-xs font-semibold text-red-500">({khgStats.rusakPct})</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">Titik panas ({timeFilter.toLowerCase()})</div>
                  <div className="text-xl font-extrabold text-amber-600 tabular-nums mt-0.5">{khgStats.hotspots}</div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">Sekat kanal</div>
                  <div className="text-xl font-extrabold text-[#2F698B] tabular-nums mt-0.5">{khgStats.sekat}</div>
                </div>
              </div>

              {/* Legend Box (matching Screen 1 legend exactly) */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-[#213A75] uppercase tracking-wider mb-3">
                  Legenda Peta
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#0D9488] shrink-0"></span>
                    <span>Titik pemantauan muka air</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-emerald-500 shrink-0"></span>
                    <span>Sekat kanal (baik)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-amber-500 shrink-0"></span>
                    <span>Sekat kanal (perlu perbaikan)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-red-600 shrink-0"></span>
                    <span>Titik panas (historis)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-0.5 bg-slate-400 shrink-0"></span>
                    <span>Jaringan kanal</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 h-0.5 border-t border-dashed border-[#409DA1] shrink-0"></span>
                    <span>Batas KHG</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 mt-6 text-[11px] text-slate-500">
              Klik salah satu titik sekat kanal untuk melakukan diagnosis intervensi mendalam.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
