"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";


import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
} from "@/components/ui/chart";

export type BarData = {
    topic: string;
    value: number;
    color: string;
    valueLeft?: number;
};
export type BarChartConfiguration = Record<
    string,
    {
        label: string;
        color: string;
    }
>;

//Example calling BarB
//   const items = [{topic: "Strings", value: 75, color: "yellow"},
//     {topic: "Bools", value: 20, color: "blue"},
//     {topic: "Loops", value: 87, color: "orange"},
//     {topic: "Const", value: 73, color: "green"},
//     {topic: "other", value: 90, color: "purple"},
// ];
// <BarB title={"Chart!!!"} data={items}/>

export function BarB({ title, data }: { title: string; data: BarData[] }) {
    const chartData = data.map((item) => ({
        topic: item.topic,
        value: item.value,
        color: item.color,
        valueLeft: 100 - item.value,
    }));
    // Use data values for bar chart
    const chartConfig: BarChartConfiguration = chartData.reduce<BarChartConfiguration>(
        (acc: BarChartConfiguration, item) => {
            acc[item.topic] = {
                label: item.topic.charAt(0).toUpperCase() + item.topic.slice(1), // Capitalize the first letter
                color: item.color || "blue", // Map fill to color if using fill
            };
            return acc;
        },
        {},
    );

    return (
        <Card className="bg-transparent text-black">
            <CardHeader className="items-center">
                <CardTitle className="text-black">{title}</CardTitle>
            </CardHeader>
            <CardContent className="min-w-[350px] ">
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        barSize={12}
                        layout="vertical"
                        margin={{
                            left: 0,
                            right: 40,
                        }}
                    >
                        <YAxis
                            dataKey="topic"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) =>
                                chartConfig[value as keyof typeof chartConfig]?.label
                            }
                        />
                        <XAxis dataKey="value" type="number" hide domain={[0, 100]} />
                        {/* <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />  */}
                        <Bar
                            dataKey="value"
                            layout="vertical"
                            stackId={"a"}
                            stroke="black"
                            strokeWidth={1}
                            radius={[25, 0, 0, 25]}
                            max={100}
                        >
                            {chartData.map((entry) => (
                                <Cell
                                    key={entry.topic}
                                    fill={chartConfig[entry.topic]?.color || "red"}
                                    from={0}
                                    to={entry.value}
                                />
                            ))}
                        </Bar>
                        <Bar
                            layout="vertical"
                            dataKey="valueLeft"
                            fill="transparent" // Make this transparent
                            stroke="black"
                            stackId={"a"}
                            strokeWidth={1}
                            radius={[0, 25, 25, 0]}
                        >
                            {chartData.map((entry) => (
                                <Cell key={`bg-${entry.topic}`} fill="transparent" />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="right"
                                offset={8}
                                formatter={(value: number) => `${value}%`}
                                className="fill-[black]"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
