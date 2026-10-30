import React, { useState } from 'react';
import { Site, Intervention, EvaluatedAction } from '../types';
import { Wrench, Hammer, CheckCircle2, Info, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

interface InterventionComparisonPageProps {
  sites: Site[];
  selectedSiteId: string;
  onSelectSite: (siteId: string) => void;
  evaluatedActions: EvaluatedAction[];
  onNavigate: (page: string) => void;
}

export const InterventionComparisonPage: React.FC<InterventionComparisonPageProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  evaluatedActions,
  onNavigate
}) => {
  const [detailModal, setDetailModal] = useState<string | null>(null);

  const siteActions = evaluatedActions.filter(a => a.site_id === selectedSiteId);
  const repairAction = siteActions.find(a => a.action === 'repair');
  const newAction = siteActions.find(a => a.action === 'new_build');
  const noAction = siteActions.find(a => a.action === 'no_intervention');
  const currentSite = sites.find(s => s.site_id === selectedSiteId) || sites[0];

  const repairFeasible = repairAction?.technical_feasibility === 1;

  return (
    <div className="space-y-6">
      {/* Top Header & Site Switcher (matching Screen 3) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 font-medium">KHG Sungai Kampar - Gaung &gt; Lokasi {currentSite.site_id}</div>
          <h1 className="text-2xl font-extrabold text-[#213A75] mt-0.5">Perbandingan Opsi Tindakan</h1>
          <p className="text-xs text-slate-500 mt-1">Evaluasi komparasi teknis, hidrologis, dan efisiensi biaya intervensi restorasi</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Pilih Lokasi:</span>
          <select
            value={selectedSiteId}
            onChange={e => onSelectSite(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-[#213A75] focus:outline-none focus:ring-2 focus:ring-[#409DA1]"
          >
            {sites.map(s => (
              <option key={s.site_id} value={s.site_id}>
                {s.site_id} — {s.site_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two Main Cards Grid (matching Screen 3 exactly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Perbaikan Sekat Lama */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2F698B]/40 transition-all">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#409DA1] flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#213A75]">Perbaikan Sekat Lama</h2>
                <div className="text-xs text-slate-400">Restorasi infrastruktur eksisting</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500 flex items-center gap-1.5">Estimasi biaya</span>
                <span className="font-extrabold text-base text-[#213A75] tabular-nums">
                  Rp {((repairAction?.cost || 350000000) / 1e6).toFixed(0)} juta
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Manfaat pembasahan</span>
                <span className="font-bold text-emerald-600">
                  +{((repairAction?.hydrological_improvement || 0.12) * 100).toFixed(0)} cm
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Kondisi infrastruktur</span>
                <span className="font-bold text-slate-700">Sedang</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Penurunan risiko kebakaran</span>
                <span className="font-bold text-orange-600">
                  {currentSite.fire_risk_index > 0
                    ? `${Math.round(((repairAction?.delta_fire_risk || 28) / currentSite.fire_risk_index) * 100)}%`
                    : '40%'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Skor Utilitas Ternormalisasi</span>
                <span className="font-extrabold text-[#2F698B]">{repairAction?.weighted_score.toFixed(2) || '41.50'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className={`text-xs font-semibold ${repairFeasible ? 'text-emerald-600' : 'text-red-500'}`}>
              {repairFeasible ? '● Layak Secara Teknis' : '● Tidak Layak (Sekat Tidak Ada)'}
            </span>
            <button
              onClick={() => setDetailModal('repair')}
              className="text-xs font-semibold text-[#2F698B] hover:text-[#213A75] hover:underline flex items-center gap-1"
            >
              Lihat detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Pembangunan Sekat Baru */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between hover:border-[#409DA1]/40 transition-all">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#213A75]">Pembangunan Sekat Baru</h2>
                <div className="text-xs text-slate-400">Konstruksi bendung kanal permanen</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Estimasi biaya</span>
                <span className="font-extrabold text-base text-[#213A75] tabular-nums">
                  Rp {((newAction?.cost || 600000000) / 1e6).toFixed(0)} juta
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Manfaat pembasahan</span>
                <span className="font-bold text-emerald-600">
                  +{((newAction?.hydrological_improvement || 0.18) * 100).toFixed(0)} cm
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Kondisi infrastruktur</span>
                <span className="font-bold text-slate-700">Baru</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Penurunan risiko kebakaran</span>
                <span className="font-bold text-orange-600">
                  {currentSite.fire_risk_index > 0
                    ? `${Math.round(((newAction?.delta_fire_risk || 45.5) / currentSite.fire_risk_index) * 100)}%`
                    : '65%'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <span className="text-slate-500">Skor Utilitas Ternormalisasi</span>
                <span className="font-extrabold text-[#2F698B]">{newAction?.weighted_score.toFixed(2) || '58.20'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">
              ● Layak Konstruksi Baru
            </span>
            <button
              onClick={() => setDetailModal('new_build')}
              className="text-xs font-semibold text-[#2F698B] hover:text-[#213A75] hover:underline flex items-center gap-1"
            >
              Lihat detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recommendation Callout Box (matching Screen 3 green recommendation callout) */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-5 shadow-xs flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-emerald-950">Rekomendasi Portofolio</div>
          <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
            <strong>Perbaikan sekat lama</strong> lebih optimal untuk lokasi ini dengan mempertimbangkan efisiensi biaya dan dampak yang cukup signifikan.
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <button
              onClick={() => onNavigate('optimization_engine')}
              className="font-bold text-emerald-800 hover:text-emerald-950 underline"
            >
              Uji dalam Mesin Optimasi Global &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Trade-off Explanation Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-[#213A75] flex items-center gap-2">
          <Info className="w-4 h-4 text-[#409DA1]" />
          Prinsip Keputusan Lokal vs Portofolio Global (Knapsack Dynamics)
        </div>
        <p className="leading-relaxed">
          Tindakan yang memiliki skor tertinggi secara absolut (misalnya Pembangunan Sekat Baru) belum tentu menjadi pilihan terbaik ketika anggaran terbatas harus dibagikan ke 24 lokasi. Dua perbaikan sekat lama berbiaya Rp 350 juta (total Rp 700 juta) seringkali menghasilkan total skor manfaat agregat yang jauh lebih besar dibandingkan satu sekat baru berbiaya Rp 600 juta.
        </p>
      </div>
    </div>
  );
};
