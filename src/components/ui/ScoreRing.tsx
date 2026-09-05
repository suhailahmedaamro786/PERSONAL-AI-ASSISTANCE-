import { useId } from 'react';
import { cn, clamp } from '../../lib/utils';

export function ScoreRing({
  value,
  size = 84,
  stroke = 8,
  label,
  tone = 'auto',
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  tone?: 'auto' | 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}) {
  const uid = useId();
  const v = clamp(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;

  const color =
    tone === 'auto'
      ? v >= 72
        ? 'var(--color-success)'
        : v >= 45
          ? 'var(--color-warning)'
          : 'var(--color-danger)'
      : tone === 'success'
        ? 'var(--color-success)'
        : tone === 'warning'
          ? 'var(--color-warning)'
          : tone === 'danger'
            ? 'var(--color-danger)'
            : 'var(--color-brand)';

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ? `${label}: ${v}%` : `${v}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--color-surface-active))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          id={uid}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular text-base font-bold text-text" style={{ fontSize: size / 5.2 }}>
          {Math.round(v)}
        </span>
        {label && <span className="text-[10px] font-medium text-text-muted">{label}</span>}
      </div>
    </div>
  );
}