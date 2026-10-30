import React from 'react';

interface DonutChartProps {
  repairCount: number;
  newBuildCount: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ repairCount, newBuildCount }) => {
  const total = repairCount + newBuildCount;
  const repairPct = total > 0 ? Math.round((repairCount / total) * 100) : 58;
  const newPct = total > 0 ? 100 - repairPct : 42;

  // Circumference for r=38 is 2 * PI * 38 = 238.76
  const circumference = 238.76;
  const repairDash = (repairPct / 100) * circumference;
  const newDash = circumference - repairDash;

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="16" />
          {/* Repair arc (#2F698B) */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#2F698B"
            strokeWidth="16"
            strokeDasharray={`${repairDash} ${circumference}`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* New build arc (#409DA1) */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#409DA1"
            strokeWidth="16"
            strokeDasharray={`${newDash} ${circumference}`}
            strokeDashoffset={-repairDash}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <div className="text-xl font-extrabold text-[#213A75] leading-none">{total}</div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Lokasi</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 mt-4 text-xs w-full max-w-xs">
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2F698B]"></span>
            <span>Perbaikan sekat lama</span>
          </div>
          <span className="font-bold text-slate-800">{repairPct}% ({repairCount})</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#409DA1]"></span>
            <span>Pembangunan sekat baru</span>
          </div>
          <span className="font-bold text-slate-800">{newPct}% ({newBuildCount})</span>
        </div>
      </div>
    </div>
  );
};
