import React, { useState } from 'react';
import { Site } from '../types';
import { Search, Filter, ArrowUpDown, ChevronRight } from 'lucide-react';

interface PeatlandAssessmentPageProps {
  sites: Site[];
  onSelectSite: (siteId: string) => void;
  onNavigate: (page: string) => void;
}

export const PeatlandAssessmentPage: React.FC<PeatlandAssessmentPageProps> = ({
  sites,
  onSelectSite,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCover, setFilterCover] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortBy, setSortBy] = useState<'risk' | 'gw' | 'area'>('risk');

  const filtered = sites
    .filter(s => {
      const matchSearch =
        s.site_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.site_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCover = filterCover === 'all' || s.land_cover === filterCover;
      const matchCond = filterCondition === 'all' || s.canal_condition === filterCondition;
      return matchSearch && matchCover && matchCond;
    })
    .sort((a, b) => {
      if (sortBy === 'risk') return b.fire_risk_index - a.fire_risk_index;
      if (sortBy === 'gw') return b.groundwater_depth - a.groundwater_depth;
      return b.affected_area - a.affected_area;
    });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#213A75]">Penilaian Gambut (Peatland Assessment)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi multi-atribut kondisi fisik, kerentanan kebakaran, dan sensitivitas ekologis per lokasi
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan kode atau nama..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#409DA1]"
          />
        </div>

        <select
          value={filterCover}
          onChange={e => setFilterCover(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
        >
          <option value="all">Semua Tutupan Lahan</option>
          <option value="Semak">Semak</option>
          <option value="Bekas terbakar">Bekas Terbakar</option>
          <option value="Hutan sekunder">Hutan Sekunder</option>
          <option value="Kebun campuran">Kebun Campuran</option>
        </select>

        <select
          value={filterCondition}
          onChange={e => setFilterCondition(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700"
        >
          <option value="all">Semua Kondisi Sekat</option>
          <option value="Baik">Baik</option>
          <option value="Rusak sebagian">Rusak Sebagian</option>
          <option value="Rusak berat">Rusak Berat</option>
          <option value="Tidak ada">Tidak Ada Sekat</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold"
        >
          <option value="risk">Urutkan: Risiko Api Tertinggi</option>
          <option value="gw">Urutkan: Defisit Muka Air Terparah</option>
          <option value="area">Urutkan: Luas Area Terbesar</option>
        </select>
      </div>

      {/* Assessment Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold">Kode</th>
                <th className="py-3 px-3 font-semibold">Nama Lokasi</th>
                <th className="py-3 px-3 font-semibold">Tutupan Lahan</th>
                <th className="py-3 px-3 font-semibold">Kondisi Sekat</th>
                <th className="py-3 px-3 font-semibold text-right">Kedalaman Muka Air</th>
                <th className="py-3 px-3 font-semibold text-right">Indeks Risiko Api</th>
                <th className="py-3 px-3 font-semibold text-right">Sensitivitas Ekologis</th>
                <th className="py-3 px-3 font-semibold text-right">Luas (ha)</th>
                <th className="py-3 px-3 font-semibold text-center">Prioritas</th>
                <th className="py-3 px-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(site => {
                const isUrgent = site.groundwater_depth >= 0.75 || site.fire_risk_index >= 75;
                const isModerate = site.groundwater_depth >= 0.50 || site.fire_risk_index >= 50;

                return (
                  <tr key={site.site_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#213A75]">{site.site_id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{site.site_name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{site.land_cover}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          site.canal_condition === 'Baik'
                            ? 'bg-emerald-50 text-emerald-700'
                            : site.canal_condition === 'Rusak sebagian'
                            ? 'bg-amber-50 text-amber-700'
                            : site.canal_condition === 'Rusak berat'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {site.canal_condition}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-red-600">
                      -{site.groundwater_depth.toFixed(2)} m
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-orange-600">
                      {site.fire_risk_index.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {site.ecological_sensitivity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      {site.affected_area} ha
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          isUrgent
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isModerate
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isUrgent ? 'Tinggi' : isModerate ? 'Sedang' : 'Terkontrol'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          onSelectSite(site.site_id);
                          onNavigate('site_diagnosis');
                        }}
                        className="text-xs font-semibold text-[#2F698B] hover:text-[#213A75] hover:underline"
                      >
                        Diagnosis &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
