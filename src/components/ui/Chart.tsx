import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPieChart,
  Pie as RechartsPie,
  Cell,
  CartesianGrid,
  type TooltipContentProps,
} from 'recharts';
import { cn } from '../../lib/utils';

export function ChartContainer({
  children,
  height,
  className,
}: {
  children: React.ReactNode;
  height: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      {children}
    </div>
  );
}

export function ChartTooltip(props: TooltipContentProps) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  const entries = payload ?? [];
  const labelText =
    typeof label === 'string' || typeof label === 'number' ? String(label) : '';
  return (
    <div className="rounded-lg border border-border bg-surface p-2.5 shadow-lg">
      {labelText !== '' && (
        <p className="mb-1 text-[12px] font-semibold text-text">{labelText}</p>
      )}
      {entries.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor:
                entry.color ?? (entry.payload as { color?: string } | undefined)?.color ?? 'var(--color-brand)',
            }}
          />
          <span className="text-text-muted">{String(entry.name ?? entry.dataKey ?? '')}</span>
          <span className="ml-auto pl-3 font-semibold text-text tabular">
            {String(entry.value ?? '')}
          </span>
        </div>
      ))}
    </div>
  );
}

export interface BarSeries {
  key: string;
  color: string;
  name: string;
}

export function BarChart({
  data,
  xKey,
  series,
  height,
  barRadius = 4,
  className,
}: {
  data: Array<Record<string, unknown>>;
  xKey: string;
  series: BarSeries[];
  height: number;
  barRadius?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tick={{ fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            allowDecimals={false}
            tick={{ fill: 'var(--color-text-muted)' }}
          />
          <Tooltip content={(tooltipProps) => <ChartTooltip {...tooltipProps} />} cursor={{ fill: 'var(--color-surface-active)' }} />
          {series.map((s) => (
            <RechartsBar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              radius={[barRadius, barRadius, 0, 0]}
              maxBarSize={28}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChart({
  data,
  dataKey,
  nameKey,
  height,
  innerRadius = 55,
  outerRadius = 80,
  className,
}: {
  data: Array<Record<string, unknown>>;
  dataKey: string;
  nameKey: string;
  height: number;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <RechartsPie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            stroke="none"
            // recharts v3's Pie sector animation leaves geometry empty on first
            // paint here; the card's framer-motion fade-in covers the entrance.
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={String(entry.color ?? 'var(--color-brand)')}
                className="outline-none"
              />
            ))}
          </RechartsPie>
          <Tooltip content={(tooltipProps) => <ChartTooltip {...tooltipProps} />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}