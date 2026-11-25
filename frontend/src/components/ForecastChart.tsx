import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SchemeForecastDay } from '../types'

interface ForecastChartProps {
  data: SchemeForecastDay[]
}

export function ForecastChart({ data }: ForecastChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    dateShort: d.date.slice(5),
    ci80Range: [d.ci_80_low_m3, d.ci_80_high_m3],
    ci95Range: [d.ci_95_low_m3, d.ci_95_high_m3],
  }))

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="dateShort" tick={{ fontSize: 12, fill: '#475569' }} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#475569' }}
            label={{
              value: 'Demand (m³/day)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: '#64748b' },
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 40]}
            tick={{ fontSize: 12, fill: '#0284c7' }}
            label={{
              value: 'Rain (mm)',
              angle: 90,
              position: 'insideRight',
              style: { fontSize: 11, fill: '#0284c7' },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="ci95Range"
            fill="#bae6fd"
            stroke="none"
            fillOpacity={0.35}
            name="95% Confidence Band"
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="ci80Range"
            fill="#38bdf8"
            stroke="none"
            fillOpacity={0.3}
            name="80% Confidence Band"
          />
          <Bar
            yAxisId="right"
            dataKey="rainfall_mm"
            fill="#0ea5e9"
            barSize={18}
            radius={[4, 4, 0, 0]}
            name="Rainfall (mm)"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="baseline_static_m3"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Static Baseline (m³)"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gross_demand_m3"
            stroke="#0f766e"
            strokeWidth={3}
            dot={{ r: 4, fill: '#0f766e' }}
            name="JalSankalp Forecast (m³)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
