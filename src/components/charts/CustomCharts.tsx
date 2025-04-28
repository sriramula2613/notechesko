
import React from "react";
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartProps {
  data: any[];
  index: string;
  categories?: string[];
  category?: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  className?: string;
}

export function BarChart({
  data,
  index,
  categories = ["value"],
  valueFormatter = (value) => `${value}`,
  colors = ["hsl(var(--primary))"],
  className,
}: ChartProps) {
  return (
    <ChartContainer
      config={{
        value: {
          theme: {
            light: colors[0],
            dark: colors[0],
          },
        },
      }}
      className={className}
    >
      <RechartsBarChart data={data}>
        <XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <ChartTooltip
          cursor={false}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              const value = payload[0].value;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{data[index]}</p>
                    <p className="text-sm">
                      {valueFormatter(value as number)}
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={colors[i % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}

export function LineChart({
  data,
  index,
  categories = ["value"],
  valueFormatter = (value) => `${value}`,
  colors = ["hsl(var(--primary))"],
  className,
}: ChartProps) {
  return (
    <ChartContainer
      config={{
        value: {
          theme: {
            light: colors[0],
            dark: colors[0],
          },
        },
      }}
      className={className}
    >
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              const value = payload[0].value;
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{data[index]}</p>
                    <p className="text-sm">
                      {valueFormatter(value as number)}
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}

export function PieChart({
  data,
  index,
  category = "value",
  valueFormatter = (value) => `${value}`,
  colors = ["hsl(var(--primary))", "hsl(var(--muted))"],
  className,
}: ChartProps) {
  return (
    <ChartContainer
      config={{
        value: {
          theme: {
            light: colors[0],
            dark: colors[0],
          },
        },
      }}
      className={className}
    >
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || colors[index % colors.length]} 
            />
          ))}
        </Pie>
        <ChartTooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              const value = data[category];
              const name = data[index];
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-sm">
                      {valueFormatter(value as number)}
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ChartContainer>
  );
}
