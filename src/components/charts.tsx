import { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { PointHistorique } from '../types/poc';
import { formatDateCourteFr, nf } from '../lib/format';

interface SparklineProps {
  data: PointHistorique[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color, height = 48 }: SparklineProps) {
  const uid = useId().replace(/:/g, '');
  const config = {
    valeur: { label: 'Valeur', color: color ?? 'var(--chart-1)' },
  } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
        <defs>
          <linearGradient id={`spark-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-valeur)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-valeur)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="valeur"
          stroke="var(--color-valeur)"
          strokeWidth={2}
          fill={`url(#spark-${uid})`}
          dot={false}
          isAnimationActive
          animationDuration={900}
        />
      </AreaChart>
    </ChartContainer>
  );
}

interface SerieLineProps {
  data: PointHistorique[];
  color?: string;
  unite?: string;
  height?: number;
}

export function SerieLine({ data, color, unite = '', height = 260 }: SerieLineProps) {
  const config = {
    valeur: { label: 'Valeur', color: color ?? 'var(--chart-1)' },
  } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => formatDateCourteFr(String(d))}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis tickLine={false} axisLine={false} width={48} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatDateCourteFr(String(value))}
              formatter={(v) => (
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {nf(Number(v))}
                  {unite}
                </span>
              )}
              indicator="dot"
            />
          }
        />
        <Line
          type="monotone"
          dataKey="valeur"
          stroke="var(--color-valeur)"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          animationDuration={1000}
        />
      </LineChart>
    </ChartContainer>
  );
}

export interface BarDatum {
  label: string;
  valeur: number;
  color?: string;
}

export function HBar({
  data,
  unite = '',
  height,
}: {
  data: BarDatum[];
  unite?: string;
  height?: number;
}) {
  const h = height ?? Math.max(120, data.length * 42);
  const config = { valeur: { label: 'Valeur' } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: h }}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={130} />
        <ChartTooltip
          cursor={{ fillOpacity: 0.1 }}
          content={
            <ChartTooltipContent
              hideIndicator
              formatter={(v) => (
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {nf(Number(v))}
                  {unite}
                </span>
              )}
            />
          }
        />
        <Bar dataKey="valeur" radius={[0, 6, 6, 0]} animationDuration={900}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? 'var(--chart-1)'} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export interface DonutDatum {
  label: string;
  valeur: number;
  color: string;
}

export function Donut({ data, height = 220 }: { data: DonutDatum[]; height?: number }) {
  const config = { valeur: { label: 'Cas' } } satisfies ChartConfig;
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height }}>
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey="label"
              hideIndicator
              formatter={(v, name) => (
                <span className="flex w-full justify-between gap-3">
                  <span className="text-muted-foreground">{String(name)}</span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {nf(Number(v))}
                  </span>
                </span>
              )}
            />
          }
        />
        <Pie
          data={data}
          dataKey="valeur"
          nameKey="label"
          innerRadius="58%"
          outerRadius="85%"
          paddingAngle={2}
          stroke="var(--card)"
          strokeWidth={2}
          animationDuration={900}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
