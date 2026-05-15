'use client';

import { useState } from 'react';

export default function AreaChart({ data, color = 'gold', suffix = '', height = 200 }: {
  data: { label: string; value: number }[];
  color?: 'gold' | 'emerald';
  suffix?: string;
  height?: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  if (!data.length) return null;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const W = 1000;
  const H = height;
  const PAD_TOP = 10;
  const PAD_BOTTOM = 20;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => ({
    x: data.length === 1 ? W / 2 : (i / (data.length - 1)) * W,
    y: PAD_TOP + chartH - (d.value / maxValue) * chartH,
    ...d,
  }));

  // Smooth path
  const linePath = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + p.x) / 2;
    return `C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
  }).join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PAD_BOTTOM} L ${points[0].x} ${H - PAD_BOTTOM} Z`;

  const gradId = `grad-${color}-${data.length}`;
  const gradColors = color === 'gold'
    ? { from: 'rgba(238,177,73,0.2)', to: 'rgba(238,177,73,0)', stroke: '#EEB149', dot: '#EEB149' }
    : { from: 'rgba(16,185,129,0.2)', to: 'rgba(16,185,129,0)', stroke: '#10B981', dot: '#10B981' };

  // X-axis: show max ~8 labels
  const labelStep = data.length <= 7 ? 1 : data.length <= 14 ? 2 : data.length <= 30 ? 5 : Math.ceil(data.length / 7);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const closest = points.reduce((best, p, i) => {
      const dist = Math.abs(p.x - x);
      return dist < best.dist ? { dist, i } : best;
    }, { dist: Infinity, i: 0 });
    setHoverIdx(closest.i);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradColors.from} />
            <stop offset="100%" stopColor={gradColors.to} />
          </linearGradient>
        </defs>

        {/* Subtle grid lines — no labels */}
        {[0.25, 0.5, 0.75].map((pct, i) => (
          <line key={i}
            x1="0" y1={PAD_TOP + chartH - pct * chartH}
            x2={W} y2={PAD_TOP + chartH - pct * chartH}
            stroke="rgba(255,255,255,0.03)" strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={gradColors.stroke} strokeWidth="2" strokeLinecap="round" />

        {/* Hover vertical line + dot */}
        {hoverIdx !== null && points[hoverIdx] && (
          <>
            <line
              x1={points[hoverIdx].x} y1={PAD_TOP}
              x2={points[hoverIdx].x} y2={H - PAD_BOTTOM}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3"
            />
            <circle cx={points[hoverIdx].x} cy={points[hoverIdx].y} r="4"
              fill={gradColors.dot} stroke="black" strokeWidth="1.5" />
          </>
        )}

        {/* X-axis labels — minimal */}
        {points.map((p, i) => {
          if (i % labelStep !== 0 && i !== data.length - 1) return null;
          return (
            <text key={i} x={p.x} y={H - 4}
              textAnchor="middle" fill="rgba(255,255,255,0.1)"
              fontSize="11" fontFamily="system-ui"
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      {/* HTML Tooltip */}
      {hovered && hoverIdx !== null && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            left: Math.min(Math.max(mousePos.x, 60), (typeof window !== 'undefined' ? window.innerWidth * 0.55 : 400)),
            top: Math.max(mousePos.y - 48, 0),
            transform: 'translateX(-50%)',
          }}
        >
          <div className="bg-black border border-white/10 px-2.5 py-1.5 shadow-xl">
            <div className="text-[8px] text-white/30 uppercase tracking-widest">{hovered.label}</div>
            <div className="text-[11px] font-bold text-white font-mono">
              {hovered.value.toLocaleString('fr-FR')}{suffix}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
