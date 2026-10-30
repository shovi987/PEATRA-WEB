import React from 'react';
import { Search, Bell, User, Sparkles } from 'lucide-react';

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  pageTitle: string;
}

export const Topbar: React.FC<TopbarProps> = ({ searchQuery, onSearchChange, pageTitle }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-10 shrink-0">
      {/* Search Input */}
      <div className="relative w-80 max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Cari lokasi / KHG / koordinat..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#409DA1] focus:bg-white transition-all"
        />
      </div>

      {/* Center Subtitle Tagline */}
      <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500">
        <span>Data yang tepat</span>
        <span className="text-[#54B79A] font-bold">&rarr;</span>
        <span>Keputusan yang bijak</span>
        <span className="text-[#54B79A] font-bold">&rarr;</span>
        <span className="text-[#213A75] font-semibold">Gambut yang lebih lestari</span>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#213A75]/10 text-[#213A75] flex items-center justify-center font-bold text-xs">
            U
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight">Selamat datang,</div>
            <div className="text-[11px] text-slate-500">User Perencana</div>
          </div>
        </div>
      </div>
    </header>
  );
};
