import React from 'react';
import { Site } from '../types';
import { MapPin, AlertCircle, Droplets, Flame, Wrench, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface SiteDiagnosisPageProps {
  sites: Site[];
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  onNavigate: (page: string) => void;
}

export const SiteDiagnosisPage: React.FC<SiteDiagnosisPageProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  onNavigate
}) => {
  const currentSite = sites.find(s => s.site_id === selectedSiteId) || sites[0];

  return (
    <div className="space-y-5">
      {/* Breadcrumb & Site Selector (matching Screen 2) */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <span>KHG Sungai Kampar - Gaung</span>
          <span>&gt;</span>
          <span className="text-[#213A75] font-bold">{currentSite.site_name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Pilih Lokasi:</span>
          <select
            value={currentSite.site_id}
            onChange={e => onSelectSite(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-[#213A75] focus:outline-none focus:ring-2 focus:ring-[#409DA1]"
          >
            {sites.map(s => (
              <option key={s.site_id} value={s.site_id}>
                {s.site_id} — {s.site_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Header with Badge */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-[#213A75]">Lokasi {currentSite.site_id}</h1>
              <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-md text-xs font-bold">
                Prioritas Tinggi
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3 font-mono">
              <span>{Math.abs(currentSite.latitude).toFixed(4)}° S, {currentSite.longitude.toFixed(4)}° E</span>
              <span>·</span>
              <span>Tutupan: {currentSite.land_cover}</span>
              <span>·</span>
              <span>Aksesibilitas: {currentSite.accessibility}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('intervention_comparison')}
            className="bg-[#2F698B] hover:bg-[#213A75] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            Bandingkan Opsi Tindakan <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Diagnostic Metrics Grid (matching Screen 2 layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tinggi Muka Air */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tinggi Muka Air</span>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2 tabular-nums">
            -{currentSite.groundwater_depth.toFixed(2)} m
          </div>
          <div className="text-xs text-red-500 font-medium mt-1">
            (di bawah normal ambang 0,40m)
          </div>
        </div>

        {/* Metric 2: Risiko Kebakaran */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risiko Kebakaran</span>
            <Flame className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-extrabold text-orange-600 mt-2">
            Tinggi
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            (skor indeks: {(currentSite.fire_risk_index / 10).toFixed(1)}/10)
          </div>
        </div>

        {/* Metric 3: Kondisi Sekat Kanal */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kondisi Sekat Kanal</span>
            <Wrench className="w-4 h-4 text-[#2F698B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#213A75] mt-2">
            {currentSite.canal_condition === 'Rusak sebagian' ? 'Perlu Perbaikan' : currentSite.canal_condition}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            ({currentSite.canal_condition === 'Rusak sebagian' ? '50% efektif' : currentSite.canal_condition === 'Baik' ? '90% efektif' : '0% efektif'})
          </div>
        </div>

        {/* Metric 4: Kondisi Gambut */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kondisi Gambut</span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">
            Sedang
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            (kedalaman gambut: 2,1 m)
          </div>
        </div>
      </div>

      {/* Two Column Layout: Hotspots vs Diagnosis Box (matching Screen 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hotspot Timeline (col-span-4) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#213A75] uppercase tracking-wider">Riwayat Titik Panas</h3>
            <span className="text-[11px] text-slate-400">Verifikasi Satelit</span>
          </div>

          <div className="space-y-3">
            {[
              { date: '12 Jun 2025', note: 'Terdeteksi citra VIIRS SNPP (Confidence 85%)' },
              { date: '03 Sep 2024', note: 'Hotspot MODIS Terra/Aqua radius 500m' },
              { date: '21 Jul 2023', note: 'Laporan patroli lapangan MPA Desa' },
              { date: '14 Okt 2022', note: 'Titik api vegetasi semak gambut' }
            ].map((hp, idx) => (
              <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0"></span>
                <div>
                  <div className="text-xs font-bold text-slate-800">{hp.date}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{hp.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Narrative Box (matching Screen 2 green summary callout) */}
        <div className="lg:col-span-7 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-base mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Hasil Diagnosis PEATRA
            </div>

            <p className="text-sm text-emerald-900 leading-relaxed font-medium">
              Lokasi ini memerlukan <strong>perbaikan sekat kanal</strong> dan <strong>peningkatan tinggi muka air</strong> untuk menurunkan risiko kebakaran berulang.
            </p>

            <div className="mt-4 pt-4 border-t border-emerald-200/60 space-y-2 text-xs text-emerald-800">
              <div className="flex items-center justify-between">
                <span>Defisit Muka Air terhadap Regulasi PP 57/2016:</span>
                <span className="font-bold text-red-700">{(currentSite.groundwater_depth - 0.40).toFixed(2)} meter</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status Kelayakan Perbaikan Sekat Lama:</span>
                <span className="font-bold text-emerald-700">Layak Teknis (Sekat Ada)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status Kelayakan Pembangunan Baru:</span>
                <span className="font-bold text-emerald-700">Layak Konstruksi Baru</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Sensitivitas Keanekaragaman Hayati:</span>
                <span className="font-bold text-slate-800">{currentSite.ecological_sensitivity} / 100 ({currentSite.affected_area} ha)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onNavigate('intervention_comparison')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              Lanjutkan ke Perbandingan Opsi Tindakan &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
