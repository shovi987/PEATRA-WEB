import React, { useState } from 'react';
import { Site, Intervention } from '../types';
import { BookOpen, Database, Code2, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DataMethodologyPageProps {
  sites: Site[];
  interventions: Intervention[];
}

export const DataMethodologyPage: React.FC<DataMethodologyPageProps> = ({ sites, interventions }) => {
  const [activeTab, setActiveTab] = useState<'math' | 'milp' | 'data'>('math');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h1 className="text-2xl font-extrabold text-[#213A75]">Data & Metodologi Ilmiah</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Spesifikasi formulasi matematis, normalisasi acuan tetap, model Binary MILP, dan sumber data
        </p>

        {/* Tab switcher */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('math')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'math'
                ? 'bg-[#2F698B] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Formulasi Matematis & Normalisasi
          </button>
          <button
            onClick={() => setActiveTab('milp')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'milp'
                ? 'bg-[#2F698B] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Model Optimasi Binary MILP & HiGHS
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'data'
                ? 'bg-[#2F698B] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Inspeksi Dataset Primer (CSV)
          </button>
        </div>
      </div>

      {/* Tab 1: Mathematical Formulas */}
      {activeTab === 'math' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5 text-xs text-slate-700">
            <div>
              <h2 className="text-base font-bold text-[#213A75] mb-2">1. Indikator Manfaat Multi-Objektif</h2>
              <p className="text-slate-600 mb-3">
                Sistem pendukung keputusan PEATRA mengevaluasi setiap kombinasi lokasi $i$ dan tindakan $a$ berdasarkan tiga kriteria terukur:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-[#213A75] mb-1">A. Penurunan Risiko Api (&Delta;F)</div>
                <div className="font-mono bg-white p-2 rounded border border-slate-200 my-2 text-[11px]">
                  &Delta;F_ia = max(0, F_i - F_ia)
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  F_i: indeks risiko awal (0–100), F_ia: indeks setelah tindakan. Mengukur penurunan kerentanan kebakaran lanskap.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-[#213A75] mb-1">B. Perbaikan Hidrologis (G_ia)</div>
                <div className="font-mono bg-white p-2 rounded border border-slate-200 my-2 text-[11px]">
                  D_i = max(0, d_i - 0.40m)<br />
                  G_ia = min(max(0, &Delta;h_ia), D_i)
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  d_i: kedalaman muka air tanah awal, d_target: 0,40m (PP No. 57/2016 jo. PP 71/2014), &Delta;h_ia: kenaikan air akibat sekat.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-[#213A75] mb-1">C. Manfaat Ekologis (V_ia)</div>
                <div className="font-mono bg-white p-2 rounded border border-slate-200 my-2 text-[11px]">
                  V_ia = (s_i / 100) &times; A_ia
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  s_i: sensitivitas ekologis habitat (0–100), A_ia: luas habitat terdampak basah (hektare ekuivalen).
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-[#213A75] text-sm mb-2">2. Normalisasi Skala Acuan Tetap (Fixed Reference)</h3>
              <p className="text-slate-600 mb-2">
                Menggunakan ambang referensi baku agar skor tetap stabil dan dapat dibandingkan lintas periode monitoring:
              </p>
              <div className="font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                S(v) = 100 &times; min(1, max(0, v / v_ref))<br /><br />
                &bull; &Delta;F_ref = 40 poin penurunan risiko<br />
                &bull; G_ref = 0,60 meter perbaikan muka air tanah<br />
                &bull; V_ref = 200 hektare ekuivalen kawasan sensitif
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="font-bold text-[#213A75] text-sm mb-2">3. Pembobotan Multi-Kriteria (U_ia)</h3>
              <div className="font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                U_ia = w_R &times; R_ia + w_W &times; W_ia + w_E &times; E_ia, di mana w_R + w_W + w_E = 1,0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: MILP Model */}
      {activeTab === 'milp' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-xs text-slate-700">
          <h2 className="text-base font-bold text-[#213A75]">Model Binary Mixed-Integer Linear Programming (MILP)</h2>
          <p className="text-slate-600">
            Formulasi matematis yang diselesaikan oleh mesin solver SciPy HiGHS:
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono space-y-3">
            <div>
              <span className="text-purple-700 font-bold">Fungsi Objektif:</span><br />
              Maksimalkan Z = &sum;_i &sum;_a (U_ia &times; x_ia)
            </div>

            <div>
              <span className="text-purple-700 font-bold">Kendala 1 (Batas Anggaran / Budget Constraint):</span><br />
              &sum;_i &sum;_a (C_ia &times; x_ia) &le; Batas Anggaran (B)
            </div>

            <div>
              <span className="text-purple-700 font-bold">Kendala 2 (Maksimal 1 Intervensi per Lokasi):</span><br />
              &sum;_a x_ia &le; 1, &forall; lokasi i
            </div>

            <div>
              <span className="text-purple-700 font-bold">Kendala 3 (Kelayakan Teknis / Technical Feasibility):</span><br />
              x_ia &le; q_ia, di mana q_ia = 1 jika layak teknis dan 0 jika tidak
            </div>

            <div>
              <span className="text-purple-700 font-bold">Kendala 4 (Variabel Biner):</span><br />
              x_ia &isin; &#123;0, 1&#125;
            </div>
          </div>

          <div className="pt-2">
            <h3 className="font-bold text-[#213A75] mb-1">Dua Tahap Pemecah Seri (Two-Stage Tie Breaking):</h3>
            <p className="text-slate-600 leading-relaxed">
              Jika terdapat beberapa kombinasi portofolio yang menghasilkan skor objektif optimal yang identik, sistem menerapkan optimasi tahap kedua: meminimalkan total biaya pengeluaran untuk memilih portofolio paling hemat anggaran.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Dataset Inspection */}
      {activeTab === 'data' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#213A75]">Dataset Primer Lokasi (sites.csv)</h2>
            <span className="text-xs text-slate-400 font-mono">{sites.length} Baris Data</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2 px-3">site_id</th>
                  <th className="py-2 px-3">site_name</th>
                  <th className="py-2 px-3">land_cover</th>
                  <th className="py-2 px-3">canal_condition</th>
                  <th className="py-2 px-3">groundwater_depth</th>
                  <th className="py-2 px-3">fire_risk_index</th>
                  <th className="py-2 px-3">ecological_sensitivity</th>
                  <th className="py-2 px-3">affected_area</th>
                  <th className="py-2 px-3">data_provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {sites.map(s => (
                  <tr key={s.site_id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-3 font-bold text-[#213A75]">{s.site_id}</td>
                    <td className="py-1.5 px-3 font-sans text-slate-800">{s.site_name}</td>
                    <td className="py-1.5 px-3 font-sans text-slate-600">{s.land_cover}</td>
                    <td className="py-1.5 px-3 font-sans text-slate-600">{s.canal_condition}</td>
                    <td className="py-1.5 px-3 text-red-600">{s.groundwater_depth}</td>
                    <td className="py-1.5 px-3 text-orange-600">{s.fire_risk_index}</td>
                    <td className="py-1.5 px-3 text-slate-600">{s.ecological_sensitivity}</td>
                    <td className="py-1.5 px-3 text-slate-600">{s.affected_area}</td>
                    <td className="py-1.5 px-3 font-sans text-slate-400 text-[11px]">{s.data_provenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
