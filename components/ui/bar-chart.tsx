"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
const chartData = [
    { month: "January", desktop: 0.5, mobile: 0.5 },
    // { month: "February", desktop: 0, mobile: 0 },
    // { month: "March", desktop: 237, mobile: 120 },
    // { month: "April", desktop: 73, mobile: 190 },
    // { month: "May", desktop: 209, mobile: 130 },
    // { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
    data_score: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-3))",
    },
    label: {
        color: "hsl(var(--background))",
    },
} satisfies ChartConfig;


export function BarGraph({ amount } : {amount: number}) {
    //amount should be from [0,100]
    const barLeftOver = 100 - amount;
    const chartData = [{ data: amount, dataLeft: barLeftOver }];
    const total = chartData[0].data + chartData[0].dataLeft;
    let barColor = "";
    if (amount <= 50){
      barColor = "red";
    }
    else if (amount <= 70){
      barColor = "orange";
    }
    else {
      barColor = "green";
    }

    return (
        <CardContent className=" h-[30px] min-w-[400px] relative ">
            <ChartContainer config={chartConfig}>
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{
                        right: 16,
                    }}
                    height={300}
                    width={500}
                    barSize={15}
                    className="absolute top-[-83px]"
                >
                    <CartesianGrid horizontal={false} vertical={false} />
                    <YAxis
                        dataKey="month"
                        type="category"
                        tickLine={false}
                        tickMargin={1}
                        axisLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                        hide
                    />
                    <XAxis dataKey="data" type="number" hide domain={[0, total]} />
                    <Bar
                        dataKey="data"
                        layout="vertical"
                        stackId={"a"}
                        fill={barColor}
                        stroke="black"
                        strokeWidth={1}
                        radius= {amount == 100 ? [25,25,25,25] : [25, 0, 0, 25]}
                        height={5}
                        width={200}
                        barSize={15}
                    >
                    </Bar>
                    <Bar
                        dataKey="dataLeft"
                        layout="vertical"
                        stackId={"a"}
                        fill="transparent"
                        stroke="black"
                        strokeWidth={1}
                        radius={[0, 25, 25, 0]}
                        height={10}
                    >
                    </Bar>
                </BarChart>
            </ChartContainer>
        </CardContent>
    );
}
