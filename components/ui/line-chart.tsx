"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export type LineData = {
  day: string,
  score: number,
};
export type LineChartConfiguration = {
  [key: string]: {
    label: string;
    score: number;
  };
};

export function LChart({ data } : {data : LineData[]} ) {
  const chartData = data;
  const chartConfig: LineChartConfiguration = chartData.reduce((acc: LineChartConfiguration, item) => {
    acc[item.day] = {
      label: item.day,
      score: item.score || 0,
    };
    return acc;
  }, {} as LineChartConfiguration);
  
  return (
    <Card className="min-w-[500px] min-h=[200px] bg-transparent">
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: -10,
              right: 12,
              top: 50,
              bottom: 0
            }}
          
          >
            <CartesianGrid vertical={false} horizontal={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 4)}
              stroke="black"
            />
            <YAxis
              ticks={[20, 40, 60, 80, 100]} // Define your custom ticks here
              domain={[0, 100]} // Defines the min and max of the Y-axis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
              stroke="black"
              
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="score"
              type="natural"
              stroke="#5aeae1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
     
    </Card>
  )
}
