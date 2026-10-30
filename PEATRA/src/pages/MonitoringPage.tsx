import React, { useState } from 'react';
import { Site, MonitoringObservation } from '../types';
import { CheckCircle2, AlertCircle, Droplets, Flame, Wrench, RefreshCw, Send, Plus } from 'lucide-react';

interface MonitoringPageProps {
  sites: Site[];
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  monitoringList: MonitoringObservation[];
  onAddObservation: (obs: MonitoringObservation) => void;
  onReOptimize: () => void;
  onNavigate: (page: string) => void;
}

export const MonitoringPage: React.FC<MonitoringPageProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  monitoringList,
  onAddObservation,
  onReOptimize,
  onNavigate
}) => {
  const [obsNotes, setObsNotes] = useState('Elevasi air menunjukkan tren positif pasca perbaikan sekat darurat. Gulma di spillway dibersihkan tim patroli.');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form states
  const [formDate, setFormDate] = useState('2026-10-30');
  const [formDepth, setFormDepth] = useState('0.44');
  const [formCond, setFormCond] = useState<'Baik' | 'Rusak sebagian' | 'Rusak berat' | 'Tidak ada'>('Baik');
  const [formFire, setFormFire] = useState('42');
  const [formNotes, setFormNotes] = useState('Pemantauan rutin lapangan');

  const currentSite = sites.find(s => s.site_id === selectedSiteId) || sites[0];
  const siteObservations = monitoringList.filter(o => o.site_id === currentSite.site_id);

  const handleReOptimizeClick = () => {
    setIsUpdating(true);
    setTimeout(() => {
      onReOptimize();
      setIsUpdating(false);
      alert('Model PEATRA berhasil diperbarui dengan data observasi tervalidasi!');
    }, 600);
  };

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    const newObs: MonitoringObservation = {
      observation_id: `OBS-${monitoringList.length + 1 < 100 ? '0' : ''}${monitoringList.length + 1}`,
      site_id: currentSite.site_id,
      observation_date: formDate,
      groundwater_depth: parseFloat(formDepth),
      canal_condition: formCond,
      fire_risk_index: parseFloat(formFire),
      hotspot_count: 0,
      validation_status: 'Tervalidasi',
      notes: formNotes
    };
    onAddObservation(newObs);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Site Profile (matching Screen 7) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#213A75]">Monitoring Pasca-Restorasi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi dampak hidrologis, audit integritas sekat kanal, dan kalibrasi adaptif model
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentSite.site_id}
            onChange={e => onSelectSite(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-[#213A75] focus:outline-none focus:ring-2 focus:ring-[#409DA1]"
          >
            {sites.map(s => (
              <option key={s.site_id} value={s.site_id}>
                {s.site_id} — {s.site_name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#2F698B] hover:bg-[#213A75] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Input Observasi Baru
          </button>
        </div>
      </div>

      {/* Site Identity Card (matching Screen 7 top identity row) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#409DA1] flex items-center justify-center font-bold text-lg">
            🌿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#213A75]">Lokasi {currentSite.site_id}</h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">
                Selesai
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5 font-mono">
              KHG Sungai Kampar - Gaung · {Math.abs(currentSite.latitude).toFixed(4)}° S, {currentSite.longitude.toFixed(4)}° E
            </div>
          </div>
        </div>

        <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-6 text-xs border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Status Validasi</div>
            <div className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Tervalidasi QA/QC
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Rekomendasi</div>
            <div className="font-bold text-[#409DA1] flex items-center gap-1.5 mt-0.5">
              <RefreshCw className="w-3.5 h-3.5 text-[#409DA1]" />
              Dapat diperbarui
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Water Table Curve vs Infrastructure Status (matching Screen 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Water Table Line Chart (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#213A75] uppercase tracking-wider">
                Tinggi Muka Air (TMA)
              </h3>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block"></span> Sebelum
                </span>
                <span className="flex items-center gap-1.5 text-[#409DA1]">
                  <span className="w-3 h-0.5 bg-[#409DA1] inline-block"></span> Sesudah
                </span>
              </div>
            </div>

            {/* SVG Line Chart (matching Screen 7 chart) */}
            <div className="h-56 w-full relative">
              <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
                {/* Horizontal elevation reference grid */}
                <line x1="30" y1="20" x2="480" y2="20" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="30" y1="60" x2="480" y2="60" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="30" y1="100" x2="480" y2="100" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="30" y1="140" x2="480" y2="140" stroke="#F1F5F9" strokeWidth="1" />

                {/* Regulatory threshold line at -0.40m */}
                <line x1="30" y1="70" x2="480" y2="70" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="35" y="65" fontSize="9" fill="#DC2626" fontWeight="bold">Ambang PP 57/2016 (-0.40m)</text>

                {/* 'Sebelum' curve (dashed grey line fluctuating around -0.78 to -0.90m) */}
                <path
                  d="M 50 135 L 120 145 L 200 130 L 280 155 L 360 140 L 450 150"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />

                {/* 'Sesudah' curve (solid teal line fluctuating around -0.42 to -0.38m) */}
                <path
                  d="M 50 85 L 120 75 L 200 65 L 280 72 L 360 62 L 450 68"
                  fill="none"
                  stroke="#409DA1"
                  strokeWidth="3.5"
                />

                {/* Markers on 'Sesudah' line */}
                <circle cx="50" cy="85" r="4" fill="#409DA1" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="120" cy="75" r="4" fill="#409DA1" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="200" cy="65" r="4" fill="#409DA1" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="280" cy="72" r="4" fill="#409DA1" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="360" cy="62" r="4" fill="#409DA1" stroke="#FFFFFF" strokeWidth="1.5" />
                <circle cx="450" cy="68" r="4" fill="#409DA1" stroke="#FFFFFF" strokeWidth="1.5" />
              </svg>

              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[9px] text-slate-400 font-mono -translate-y-2">
                <span>0,0 m</span>
                <span>-0,5 m</span>
                <span>-1,0 m</span>
                <span>-1,5 m</span>
              </div>

              {/* X-axis months */}
              <div className="flex justify-between text-[10px] text-slate-500 px-10 mt-1 font-semibold">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>Mei</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Rata-rata Kenaikan Muka Air: <strong className="text-emerald-600">+14 cm</strong></span>
            <span className="text-emerald-700 font-medium">Kepatuhan Regulasi Terpenuhi</span>
          </div>
        </div>

        {/* Right Column: Infrastructure & Observations (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-3">
              Kondisi Infrastruktur
            </h3>

            {/* Checklist (matching Screen 7) */}
            <div className="space-y-2.5 text-xs pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sekat kanal</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Baik
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Saluran</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Baik
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Akses</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Baik
                </span>
              </div>
            </div>

            {/* Hotspot comparison (matching Screen 7) */}
            <div className="py-4 border-b border-slate-100 text-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Riwayat Hotspot</div>
                <div className="text-slate-600 text-[11px]">Satelit MODIS/VIIRS</div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] text-slate-400">Sebelum</div>
                  <div className="text-sm font-extrabold text-red-600">3 titik</div>
                </div>
                <div className="text-slate-300 font-bold">&rarr;</div>
                <div>
                  <div className="text-[10px] text-slate-400">Setelah</div>
                  <div className="text-sm font-extrabold text-emerald-600">0 titik</div>
                </div>
              </div>
            </div>

            {/* Notes Textarea (matching Screen 7) */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold text-[#213A75] uppercase tracking-wider mb-1.5">
                Catatan Observasi Lapangan
              </label>
              <textarea
                value={obsNotes}
                onChange={e => setObsNotes(e.target.value)}
                rows={3}
                placeholder="Tulis hasil observasi..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#409DA1]"
              />
            </div>
          </div>

          {/* Action Button (matching Screen 7 "Perbarui Rekomendasi" green button) */}
          <div className="mt-5">
            <button
              onClick={handleReOptimizeClick}
              disabled={isUpdating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Memperbarui Model...' : 'Perbarui Rekomendasi'}
            </button>
          </div>
        </div>
      </div>

      {/* Observation History Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#213A75] uppercase tracking-wider mb-3">
          Log Audit Pemantauan Lapangan (Monitoring Logs)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">ID Observasi</th>
                <th className="py-2.5 px-3 font-semibold">Lokasi</th>
                <th className="py-2.5 px-3 font-semibold">Tanggal</th>
                <th className="py-2.5 px-3 font-semibold text-right">TMA (m)</th>
                <th className="py-2.5 px-3 font-semibold">Kondisi Sekat</th>
                <th className="py-2.5 px-3 font-semibold text-right">Risiko Api</th>
                <th className="py-2.5 px-3 font-semibold">Status QA/QC</th>
                <th className="py-2.5 px-3 font-semibold">Catatan Lapangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {monitoringList.map(obs => (
                <tr key={obs.observation_id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-[#213A75]">{obs.observation_id}</td>
                  <td className="py-2 px-3 font-sans text-slate-800">{obs.site_id}</td>
                  <td className="py-2 px-3 text-slate-600">{obs.observation_date}</td>
                  <td className="py-2 px-3 text-right text-red-600 font-bold">-{obs.groundwater_depth.toFixed(2)}</td>
                  <td className="py-2 px-3 font-sans text-slate-800">{obs.canal_condition}</td>
                  <td className="py-2 px-3 text-right text-orange-600">{obs.fire_risk_index}</td>
                  <td className="py-2 px-3 font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        obs.validation_status === 'Tervalidasi'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {obs.validation_status}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-600 max-w-xs truncate">{obs.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Observation Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#213A75]">Input Observasi Pemantauan Lapangan</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveObservation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tanggal Observasi:</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Tinggi Muka Air Tanah (meter):</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="2"
                  value={formDepth}
                  onChange={e => setFormDepth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Kondisi Sekat Kanal Fisik:</label>
                <select
                  value={formCond}
                  onChange={e => setFormCond(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                >
                  <option value="Baik">Baik (Berfungsi optimal)</option>
                  <option value="Rusak sebagian">Rusak sebagian (Perlu perbaikan)</option>
                  <option value="Rusak berat">Rusak berat (Jebol/bocor)</option>
                  <option value="Tidak ada">Tidak ada sekat</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Indeks Risiko Api (0-100):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formFire}
                  onChange={e => setFormFire(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Catatan Tambahan Lapangan:</label>
                <textarea
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan & Tervalidasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
