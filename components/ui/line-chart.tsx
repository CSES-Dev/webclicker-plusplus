"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export type LineData = {
    day: string;
    score: number;
};
export type LineChartConfiguration = Record<
    string,
    {
        label: string;
        score: number;
    }
>;
// EXAMPLE CALLING LChart
// const lineChartData = [
//   { day: "1/6", score: 23 },
//   { day: "1/7", score: 57 },
//   { day: "1/8", score: 50 },
//   { day: "1/9", score: 75 },
//   { day: "1/10", score: 70 },
// ];
// <LChart data={lineChartData}/>

export function LChart({ data }: { data: LineData[] }) {
    //use data for the values
    const chartData = data;
    const chartConfig: LineChartConfiguration = chartData.reduce<LineChartConfiguration>(
        (acc: LineChartConfiguration, item) => {
            acc[item.day] = {
                label: item.day,
                score: item.score || 0,
            };
            return acc;
        },
        {},
    );

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
                            bottom: 0,
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
                            ticks={[20, 40, 60, 80, 100]} //Y-axis ticks
                            domain={[0, 100]}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${value}%`}
                            stroke="black"
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
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
    );
}
