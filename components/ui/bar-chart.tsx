"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

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

//<BarGraph amount={100}/>
//Singular bar line chart
export function BarGraph({ amount }: { amount: number }) {
    //amount should be from [0,100]
    const barLeftOver = 100 - amount;
    const chartData = [{ data: amount, dataLeft: barLeftOver }];
    let barColor = "";
    if (amount <= 50) {
        barColor = "red";
    } else if (amount <= 70) {
        barColor = "orange";
    } else {
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
                        tickFormatter={(value: unknown) =>
                            typeof value === "string" ? value.slice(0, 3) : ""
                        }
                        hide
                    />
                    <XAxis dataKey="data" type="number" hide domain={[0, 100]} />
                    <Bar
                        dataKey="data"
                        layout="vertical"
                        stackId={"a"}
                        fill={barColor}
                        stroke="black"
                        strokeWidth={1}
                        radius={amount === 100 ? [25, 25, 25, 25] : [25, 0, 0, 25]}
                        height={5}
                        width={200}
                        barSize={15}
                    ></Bar>
                    <Bar
                        dataKey="dataLeft"
                        layout="vertical"
                        stackId={"a"}
                        fill="transparent"
                        stroke="black"
                        strokeWidth={1}
                        radius={[0, 25, 25, 0]}
                        height={10}
                    ></Bar>
                </BarChart>
            </ChartContainer>
        </CardContent>
    );
}
