'use client';

export function Skeleton({ className = '', style }: { className?: string, style?: React.CSSProperties }) {
  return <div className={`bg-white/[0.04] animate-pulse rounded-sm ${className}`} style={style} />;
}

export function CardSkeleton() {
  return (
    <div className="border border-white/5 bg-zinc-950 p-6 flex flex-col gap-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-2 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="border border-white/10 bg-zinc-950 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-4"><Skeleton className="h-3 w-16" /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-white/5">
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="p-4"><Skeleton className="h-4 w-full max-w-[120px]" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="w-full flex items-end gap-1" style={{ height }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${Math.random() * 60 + 20}%` }} />
      ))}
    </div>
  );
}
