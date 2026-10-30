import React, { useState } from 'react';
import { Site } from '../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface InteractiveMapProps {
  sites: Site[];
  selectedSiteId?: string;
  onSelectSite?: (siteId: string) => void;
  activeLayer?: 'all' | 'canal' | 'tma' | 'fire';
  height?: string;
  highlightSelectedOnly?: boolean;
  selectedActionMap?: Map<string, string>;
  khgName?: string;
  timeFilter?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  activeLayer = 'all',
  height = '500px',
  selectedActionMap,
  khgName = 'KHG Sungai Kampar - Gaung',
  timeFilter = 'Terakhir 5 tahun'
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hoveredSite, setHoveredSite] = useState<any | null>(null);

  // Dynamic Sites & Geometry based on selected KHG
  const isSiak = khgName.toLowerCase().includes('siak');
  const isRokan = khgName.toLowerCase().includes('rokan');

  // Generate sites appropriate for each KHG if user switches
  const currentKhgSites = React.useMemo(() => {
    if (isSiak) {
      return [
        { site_id: 'SK-01', site_name: 'Lokasi SK-01 - Kanal Danau Zamrud', land_cover: 'Hutan sekunder', canal_condition: 'Baik', groundwater_depth: 0.42, fire_risk_index: 38, affected_area: 240, x: 220, y: 160 },
        { site_id: 'SK-02', site_name: 'Lokasi SK-02 - Semak Penyangga Siak', land_cover: 'Semak', canal_condition: 'Rusak sebagian', groundwater_depth: 0.74, fire_risk_index: 68, affected_area: 140, x: 360, y: 190 },
        { site_id: 'SK-03', site_name: 'Lokasi SK-03 - Bekas Terbakar Siak Hilir', land_cover: 'Bekas terbakar', canal_condition: 'Rusak berat', groundwater_depth: 0.88, fire_risk_index: 84, affected_area: 195, x: 520, y: 150 },
        { site_id: 'SK-04', site_name: 'Lokasi SK-04 - Kebun Campuran Rawa', land_cover: 'Kebun campuran', canal_condition: 'Tidak ada', groundwater_depth: 0.68, fire_risk_index: 62, affected_area: 110, x: 290, y: 280 },
        { site_id: 'SK-05', site_name: 'Lokasi SK-05 - Kanal Primer Mempura', land_cover: 'Semak', canal_condition: 'Rusak sebagian', groundwater_depth: 0.76, fire_risk_index: 72, affected_area: 165, x: 440, y: 270 },
        { site_id: 'SK-06', site_name: 'Lokasi SK-06 - Hutan Kubah Teluk Mesjid', land_cover: 'Hutan sekunder', canal_condition: 'Baik', groundwater_depth: 0.36, fire_risk_index: 32, affected_area: 280, x: 610, y: 240 },
        { site_id: 'SK-07', site_name: 'Lokasi SK-07 - Semak Terdegradasi Sei Mandau', land_cover: 'Semak', canal_condition: 'Rusak berat', groundwater_depth: 0.82, fire_risk_index: 78, affected_area: 150, x: 380, y: 380 },
        { site_id: 'SK-08', site_name: 'Lokasi SK-08 - Rawa Gambut Sungai Apit', land_cover: 'Bekas terbakar', canal_condition: 'Tidak ada', groundwater_depth: 0.92, fire_risk_index: 86, affected_area: 210, x: 560, y: 360 }
      ];
    } else if (isRokan) {
      return [
        { site_id: 'RH-01', site_name: 'Lokasi RH-01 - Muara Kubu Rawa', land_cover: 'Semak', canal_condition: 'Rusak berat', groundwater_depth: 0.90, fire_risk_index: 85, affected_area: 220, x: 190, y: 180 },
        { site_id: 'RH-02', site_name: 'Lokasi RH-02 - Bekas Terbakar Pasir Limau', land_cover: 'Bekas terbakar', canal_condition: 'Tidak ada', groundwater_depth: 0.96, fire_risk_index: 90, affected_area: 260, x: 320, y: 140 },
        { site_id: 'RH-03', site_name: 'Lokasi RH-03 - Kebun Campuran Tanah Putih', land_cover: 'Kebun campuran', canal_condition: 'Rusak sebagian', groundwater_depth: 0.65, fire_risk_index: 64, affected_area: 130, x: 480, y: 160 },
        { site_id: 'RH-04', site_name: 'Lokasi RH-04 - Kanal Sekunder Bagansiapiapi', land_cover: 'Semak', canal_condition: 'Rusak sebagian', groundwater_depth: 0.75, fire_risk_index: 74, affected_area: 175, x: 260, y: 290 },
        { site_id: 'RH-05', site_name: 'Lokasi RH-05 - Hutan Rawa Rokan Tengah', land_cover: 'Hutan sekunder', canal_condition: 'Baik', groundwater_depth: 0.40, fire_risk_index: 35, affected_area: 250, x: 430, y: 280 },
        { site_id: 'RH-06', site_name: 'Lokasi RH-06 - Semak Rawan Simpang Kanan', land_cover: 'Semak', canal_condition: 'Rusak berat', groundwater_depth: 0.86, fire_risk_index: 82, affected_area: 180, x: 590, y: 260 },
        { site_id: 'RH-07', site_name: 'Lokasi RH-07 - Bekas Terbakar Pujud', land_cover: 'Bekas terbakar', canal_condition: 'Tidak ada', groundwater_depth: 0.94, fire_risk_index: 88, affected_area: 230, x: 370, y: 390 }
      ];
    } else {
      // Default: Kampar - Gaung
      const minLat = -0.31;
      const maxLat = -0.20;
      const minLon = 101.81;
      const maxLon = 101.90;
      return sites.map(s => ({
        ...s,
        x: 80 + ((s.longitude - minLon) / (maxLon - minLon)) * 640,
        y: 60 + ((maxLat - s.latitude) / (maxLat - minLat)) * 380
      }));
    }
  }, [isSiak, isRokan, sites]);

  // Hotspots count depending on time filter
  const hotspotIntensity = timeFilter.includes('2026') ? 0.3 : timeFilter.includes('3') ? 0.6 : 1.0;

  return (
    <div className="relative bg-[#F0F7F4] border border-slate-200 rounded-xl overflow-hidden select-none" style={{ height }}>
      {/* Map Control Buttons */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-200 shadow-sm">
        <button
          onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.0))}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel(1)}
          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Header Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#213A75] shadow-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        {khgName}
      </div>

      {/* SVG Canvas Map */}
      <svg
        viewBox="0 0 800 500"
        className="w-full h-full object-cover transition-transform duration-300"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <defs>
          <radialGradient id="domeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#409DA1" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#54B79A" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#84E488" stopOpacity="0.05" />
          </radialGradient>
          <radialGradient id="lakeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
          </radialGradient>
          <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* 1. KHG Siak - Kampar Specific Geometry */}
        {isSiak && (
          <g>
            {/* Siak Peat Dome (Elongated Coastal Dome toward Malacca Strait) */}
            <path
              d="M 100 240 C 150 120, 420 80, 680 140 C 740 220, 720 360, 580 420 C 380 460, 180 430, 90 350 Z"
              fill="url(#domeGrad)"
              stroke="#409DA1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Danau Zamrud Peat Reserve Lake */}
            <ellipse cx="230" cy="180" rx="35" ry="20" fill="url(#lakeGrad)" stroke="#0284C7" strokeWidth="1.5" />
            <text x="230" y="184" textAnchor="middle" fontSize="9" fill="#0369A1" fontWeight="bold">Danau Zamrud</text>

            {/* Sungai Siak (Deep meandering northern river) */}
            <path
              d="M 40 120 Q 180 140 280 110 T 500 130 T 760 100"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <text x="660" y="90" fontSize="10" fill="#0284C7" fontWeight="bold">Sungai Siak</text>

            {/* Canal Network Grids for Siak */}
            <g stroke="#94A3B8" strokeWidth="1.2" strokeOpacity="0.6">
              <line x1="180" y1="120" x2="180" y2="400" />
              <line x1="300" y1="110" x2="300" y2="430" />
              <line x1="420" y1="130" x2="420" y2="420" />
              <line x1="540" y1="120" x2="540" y2="390" />
              <line x1="650" y1="110" x2="650" y2="340" />
              <line x1="120" y1="230" x2="710" y2="230" />
              <line x1="140" y1="320" x2="660" y2="320" />
            </g>
          </g>
        )}

        {/* 2. KHG Rokan Hilir Specific Geometry */}
        {isRokan && (
          <g>
            {/* Rokan Coastal Peat Delta */}
            <path
              d="M 140 150 C 220 80, 520 70, 710 160 C 750 260, 700 390, 540 440 C 340 470, 160 410, 110 320 Z"
              fill="url(#domeGrad)"
              stroke="#409DA1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {/* Sungai Rokan & Delta Branches */}
            <path
              d="M 70 380 Q 220 300 380 230 T 600 140 T 740 60"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            <path
              d="M 380 230 Q 460 280 560 350 T 730 410"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <text x="640" y="55" fontSize="10" fill="#0284C7" fontWeight="bold">Muara Sungai Rokan</text>

            {/* Canal Network Grids for Rokan */}
            <g stroke="#94A3B8" strokeWidth="1.2" strokeOpacity="0.6">
              <line x1="160" y1="180" x2="500" y2="180" />
              <line x1="200" y1="260" x2="640" y2="260" />
              <line x1="240" y1="340" x2="680" y2="340" />
              <line x1="220" y1="120" x2="220" y2="400" />
              <line x1="340" y1="100" x2="340" y2="430" />
              <line x1="470" y1="120" x2="470" y2="440" />
              <line x1="600" y1="140" x2="600" y2="400" />
            </g>
          </g>
        )}

        {/* 3. KHG Sungai Kampar - Gaung Geometry (Default) */}
        {!isSiak && !isRokan && (
          <g>
            <path
              d="M 120 180 C 180 80, 480 60, 680 120 C 760 180, 740 380, 620 440 C 440 480, 220 450, 100 380 C 60 300, 80 240, 120 180 Z"
              fill="url(#domeGrad)"
              stroke="#409DA1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M 50 220 Q 200 240 350 210 T 600 250 T 780 220"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <text x="690" y="210" fontSize="10" fill="#0284C7" fontWeight="bold">Sungai Kampar</text>
            <path
              d="M 280 470 Q 320 380 350 320 T 450 180 T 520 50"
              fill="none"
              stroke="url(#riverGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <text x="360" y="315" fontSize="10" fill="#0284C7" fontWeight="bold">Sungai Gaung</text>

            <g stroke="#94A3B8" strokeWidth="1.2" strokeOpacity="0.6">
              <line x1="200" y1="120" x2="200" y2="400" />
              <line x1="290" y1="100" x2="290" y2="430" />
              <line x1="380" y1="90" x2="380" y2="440" />
              <line x1="470" y1="100" x2="470" y2="430" />
              <line x1="560" y1="120" x2="560" y2="410" />
              <line x1="640" y1="150" x2="640" y2="380" />
              <line x1="140" y1="180" x2="680" y2="180" />
              <line x1="120" y1="260" x2="710" y2="260" />
              <line x1="140" y1="340" x2="680" y2="340" />
            </g>
          </g>
        )}

        {/* Hotspot Clusters depending on layer & time filter */}
        <g opacity={(activeLayer === 'all' || activeLayer === 'fire') ? hotspotIntensity : 0.05}>
          {isSiak ? (
            <>
              <circle cx="515" cy="155" r="15" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="515" cy="155" r="5" fill="#DC2626" />
              <circle cx="375" cy="375" r="16" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="375" cy="375" r="6" fill="#DC2626" />
              <circle cx="560" cy="355" r="14" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="560" cy="355" r="5" fill="#DC2626" />
            </>
          ) : isRokan ? (
            <>
              <circle cx="320" cy="140" r="18" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="320" cy="140" r="7" fill="#DC2626" />
              <circle cx="590" cy="260" r="15" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="590" cy="260" r="6" fill="#DC2626" />
              <circle cx="370" cy="390" r="17" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="370" cy="390" r="6" fill="#DC2626" />
              <circle cx="190" cy="180" r="14" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="190" cy="180" r="5" fill="#DC2626" />
            </>
          ) : (
            <>
              <circle cx="285" cy="185" r="14" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="285" cy="185" r="5" fill="#DC2626" />
              <circle cx="465" cy="335" r="16" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="465" cy="335" r="6" fill="#DC2626" />
              <circle cx="560" cy="255" r="12" fill="#EF4444" fillOpacity="0.25" />
              <circle cx="560" cy="255" r="4" fill="#DC2626" />
            </>
          )}
        </g>

        {/* Site Pins */}
        {currentKhgSites.map((site: any) => {
          const cx = site.x;
          const cy = site.y;
          const isSelected = site.site_id === selectedSiteId;
          const assignedAction = selectedActionMap?.get(site.site_id);

          let pinColor = '#2F698B';
          if (assignedAction) {
            pinColor = assignedAction === 'new_build' ? '#409DA1' : '#2F698B';
          } else if (activeLayer === 'canal') {
            pinColor =
              site.canal_condition === 'Baik'
                ? '#10B981'
                : site.canal_condition === 'Rusak sebagian'
                ? '#F59E0B'
                : site.canal_condition === 'Rusak berat'
                ? '#EF4444'
                : '#94A3B8';
          } else if (activeLayer === 'fire') {
            pinColor = site.fire_risk_index > 75 ? '#DC2626' : site.fire_risk_index > 55 ? '#F59E0B' : '#10B981';
          } else if (activeLayer === 'tma') {
            pinColor = site.groundwater_depth > 0.70 ? '#EF4444' : site.groundwater_depth > 0.50 ? '#F59E0B' : '#0D9488';
          }

          return (
            <g
              key={site.site_id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => onSelectSite?.(site.site_id)}
              onMouseEnter={() => setHoveredSite(site)}
              onMouseLeave={() => setHoveredSite(null)}
            >
              {isSelected && (
                <circle cx={cx} cy={cy} r="18" fill="none" stroke="#2563EB" strokeWidth="2.5" className="animate-ping opacity-75" />
              )}

              {site.canal_condition !== 'Tidak ada' ? (
                <polygon
                  points={`${cx},${cy - 10} ${cx + 9},${cy + 7} ${cx - 9},${cy + 7}`}
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />
              ) : (
                <circle
                  cx={cx}
                  cy={cy}
                  r="7"
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                />
              )}

              <text
                x={cx}
                y={cy - 13}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#1E293B"
                className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]"
              >
                {site.site_id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredSite && (
        <div
          className="absolute z-30 pointer-events-none bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs"
          style={{
            left: Math.min(Math.max(hoveredSite.x - 80, 20), 550),
            top: Math.min(Math.max(hoveredSite.y + 20, 20), 380)
          }}
        >
          <div className="font-bold text-[#213A75]">{hoveredSite.site_name}</div>
          <div className="text-slate-500 text-[11px] mt-0.5">Tutupan: {hoveredSite.land_cover} | Sekat: {hoveredSite.canal_condition}</div>
          <div className="flex items-center gap-3 mt-2 font-medium">
            <span className="text-red-600">TMA: -{hoveredSite.groundwater_depth.toFixed(2)}m</span>
            <span className="text-orange-600">Risiko: {hoveredSite.fire_risk_index}</span>
            <span className="text-emerald-600">Area: {hoveredSite.affected_area}ha</span>
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">Klik untuk membuka diagnosis lokasi &rarr;</div>
        </div>
      )}
    </div>
  );
};
