"use client";

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";

// -start position 90 -> -270 end position
// map the value [0,100] to be [0,360] so it can be relative to the circle
//

const PieSchema = z.object({
    amount: z.coerce.number().gte(0).lte(100),
    name: z.string(),
});

const chartConfig = {
    data_score: {
        label: "Data",
    },
    safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))", //text color will correspond to .dark{--chart-2} color in global css
    },
} satisfies ChartConfig;

export type PieData = {
    value: number;
    pie_label: string;
};

//<Pie_Chart value={90} pie_label={"Attendance"}/>
export function PieChart({ value, pie_label }: PieData) {
    const validated_data = PieSchema.safeParse({
        amount: value,
        name: pie_label,
    });

    if (!validated_data.success) {
        //might change zod validation to just set value to 0 if less than 0 and to 100 if greater than 100
        return;
    }

    //set up pie chart and colors
    const { amount, name } = validated_data.data;
    const graph_end_coordinate = 90 - Number((amount / 100) * 360);
    let color = "";
    if (amount <= 55) {
        color = "#ffa1a1";
    } else if (amount <= 75) {
        color = "#deff84";
    } else if (amount <= 90) {
        color = "#a6f3c1";
    } else {
        color = "#A7F2C2";
    }

    const chartData = [{ browser: "safari", data_score: amount, fill: color }];

    return (
        <Card className="flex flex-col bg-transparent border-none shadow-none">
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square min-h-[200px] max-h-[200px] max-w-[200px]"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={90}
                        endAngle={graph_end_coordinate}
                        innerRadius={80}
                        outerRadius={110}
                    >
                        <PolarGrid
                            gridType="circle"
                            radialLines={false}
                            stroke="none"
                            className="first:fill-[#27272a] last:fill-foreground"
                            polarRadius={[86, 74]}
                        />
                        <RadialBar
                            dataKey="data_score"
                            background
                            cornerRadius={0}
                            className="fill-transparent"
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            {/* The score and title in the pie chart */}
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy ?? 0) - 35}
                                                    className="fill[black] font-medium text-black"
                                                >
                                                    {name}
                                                </tspan>

                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy ?? 0) + 10}
                                                    className="fill[black] text-5xl font-semibold text-black"
                                                >
                                                    {chartData[0].data_score.toLocaleString()}
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
