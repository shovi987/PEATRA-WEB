import React, { useState } from 'react';
import { Site, Intervention, MonitoringObservation, OptimizationResult } from '../types';
import { FileDown, Download, RotateCcw, CheckCircle2, Terminal, ExternalLink } from 'lucide-react';
import { generateStreamlitZip, triggerDownload } from '../utils/zipGenerator';

interface ReportsSettingsPageProps {
  sites: Site[];
  interventions: Intervention[];
  monitoringList: MonitoringObservation[];
  optimizationResult: OptimizationResult;
  budget: number;
  onResetData: () => void;
}

export const ReportsSettingsPage: React.FC<ReportsSettingsPageProps> = ({
  sites,
  interventions,
  monitoringList,
  optimizationResult,
  budget,
  onResetData
}) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeChosen = optimizationResult.actions.filter(
    a => a.selected && a.action !== 'no_intervention'
  );

  const handleDownloadCsv = () => {
    const headers = 'site_id,action,action_label,cost,hydrological_improvement,delta_fire_risk,weighted_score\n';
    const rows = activeChosen
      .map(
        a =>
          `${a.site_id},${a.action},"${a.action_label}",${a.cost},${a.hydrological_improvement},${a.delta_fire_risk},${a.weighted_score}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    triggerDownload(blob, 'peatra_rekomendasi_restorasi.csv');
  };

  const handleDownloadJson = () => {
    const data = {
      khg: 'KHG Sungai Kampar - Gaung',
      budget,
      totalCost: optimizationResult.totalCost,
      remainingBudget: optimizationResult.remainingBudget,
      totalScore: optimizationResult.totalScore,
      numSelected: optimizationResult.numSelected,
      status: optimizationResult.status,
      recommendations: activeChosen
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    triggerDownload(blob, 'peatra_rekomendasi_restorasi.json');
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      // Direct download of the built zip
      const link = document.createElement('a');
      link.href = '/peatra_streamlit_app.zip';
      link.download = 'PEATRA_Streamlit_Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh arsip zip.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <h1 className="text-2xl font-extrabold text-[#213A75]">Laporan Eksekutif & Pengaturan Sistem</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ekspor portofolio rekomendasi, unduh arsip proyek Streamlit lengkap, dan panduan publikasi
        </p>
      </div>

      {/* Download Full Project ZIP Card */}
      <div className="bg-gradient-to-r from-[#213A75] to-[#2F698B] rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span>📦 Source Code Siap Pakai</span>
          </div>
          <h2 className="text-lg font-bold mt-1">Unduh Proyek Streamlit Lengkap (.ZIP)</h2>
          <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
            Berisi seluruh file source code Python: <code className="text-emerald-300">app.py</code>, <code className="text-emerald-300">requirements.txt</code>, <code className="text-emerald-300">data/*.csv</code>, 10 halaman multi-page, modul optimasi HiGHS, dan unit test.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="bg-emerald-500 hover:bg-emerald-600 text-[#0F291E] font-extrabold px-5 py-3 rounded-lg text-xs flex items-center gap-2 transition-colors shrink-0 shadow-md disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isZipping ? 'Mengemas ZIP...' : 'Unduh Project Streamlit (.ZIP)'}
        </button>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Arsip <strong>PEATRA_Full_Streamlit_Project.zip</strong> berhasil diunduh! Buka panduan di bawah untuk menjalankan atau deploy ke GitHub.
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV & JSON Export */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider">
            Ekspor Data Keputusan
          </h2>
          <p className="text-xs text-slate-500">
            Unduh matriks rekomendasi hasil optimasi saat ini dalam format tabel atau data mentah terstruktur.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleDownloadCsv}
              className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              Unduh CSV
            </button>
            <button
              onClick={handleDownloadJson}
              className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FileDown className="w-4 h-4 text-blue-600" />
              Unduh JSON
            </button>
          </div>
        </div>

        {/* Reset State */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#213A75] uppercase tracking-wider">
            Reset Data Demo
          </h2>
          <p className="text-xs text-slate-500">
            Kembalikan seluruh parameter bobot, observasi monitoring, dan dataset ke kondisi awal default.
          </p>

          <button
            onClick={() => {
              onResetData();
              alert('Data berhasil direset ke kondisi awal.');
            }}
            className="w-full bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-700 hover:text-red-700 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset ke Kondisi Awal Demo
          </button>
        </div>
      </div>

      {/* Deployment Instructions Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 text-xs text-slate-700">
        <h2 className="text-base font-bold text-[#213A75] flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#409DA1]" />
          Panduan Deployment ke GitHub & Streamlit Community Cloud
        </h2>

        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px]">
          <div>
            <div className="font-bold text-slate-800 font-sans mb-1">1. Ekstrak ZIP & Masuk ke Folder Proyek:</div>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto">
              unzip PEATRA_Full_Streamlit_Project.zip<br />
              cd PEATRA
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-800 font-sans mb-1">2. Pasang Dependensi & Jalankan Lokal:</div>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto">
              pip install -r requirements.txt<br />
              streamlit run app.py
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-800 font-sans mb-1">3. Buat Repositori GitHub & Push:</div>
            <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto">
              git init<br />
              git add .<br />
              git commit -m "feat: complete PEATRA application"<br />
              git branch -M main<br />
              git remote add origin https://github.com/USERNAME/peatra-optimizer.git<br />
              git push -u origin main
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-800 font-sans mb-1">4. Publikasikan di Streamlit Cloud:</div>
            <p className="text-slate-600 font-sans">
              Buka <a href="https://share.streamlit.io" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">share.streamlit.io</a>, pilih repositori GitHub Anda, set Main file: <code>app.py</code>, lalu klik <strong>Deploy</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
