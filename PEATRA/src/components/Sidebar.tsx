import React from 'react';
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  Crosshair,
  Scale,
  Cpu,
  Coins,
  CloudSun,
  Activity,
  BookOpen,
  FileText
} from 'lucide-react';

export interface SidebarProps {
  currentPage: string;
  onSelectPage: (page: string) => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
  { id: 'peatland_map', label: 'Peta & Data', icon: Map },
  { id: 'assessment', label: 'Penilaian Gambut', icon: ClipboardList },
  { id: 'site_diagnosis', label: 'Diagnosis Lokasi', icon: Crosshair },
  { id: 'intervention_comparison', label: 'Rekomendasi Tindakan', icon: Scale },
  { id: 'optimization_engine', label: 'Optimasi (MILP)', icon: Cpu },
  { id: 'budget_simulator', label: 'Simulator Anggaran', icon: Coins },
  { id: 'scenario_simulator', label: 'Simulator Skenario', icon: CloudSun },
  { id: 'monitoring', label: 'Monitoring & Evaluasi', icon: Activity },
  { id: 'data_methodology', label: 'Data & Metodologi', icon: BookOpen }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onSelectPage }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
          <svg className="w-6 h-6 fill-current text-emerald-600" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-[#213A75] leading-none">PEATRA</h1>
          <p className="text-[10px] text-[#409DA1] font-semibold mt-1">Adaptive Peatland Optimizer</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Modul Analisis
        </div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#2F698B] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Pilot Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="text-[11px] font-bold text-[#213A75]">Wilayah Pilot</div>
        <div className="text-[11px] text-slate-500 truncate mt-0.5">KHG S. Kampar - Gaung</div>
        <div className="text-[10px] text-emerald-600 font-medium mt-1">Kab. Pelalawan, Riau</div>
      </div>
    </aside>
  );
};
