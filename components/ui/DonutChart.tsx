import React from "react";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Label, Pie, PieChart } from "recharts";

interface Props {
    chartData: {}[];
    chartConfig: ChartConfig;
    dataKey: string;
    nameKey: string;
    description: string;
    descriptionStatistic: number;
}

export default function DonutChart({
    chartData,
    chartConfig,
    dataKey,
    nameKey,
    description,
    descriptionStatistic,
}: Props) {
    return (
        <ChartContainer config={chartConfig} className="aspect-square max-h-[330px]">
            <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                    data={chartData}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    innerRadius={"65%"}
                    strokeWidth={15}
                    startAngle={90}
                    endAngle={-270}
                >
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
                                            y={viewBox.cy}
                                            className="fill-foreground text-3xl font-bold"
                                        >
                                            {`${descriptionStatistic}%`}
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + 24}
                                            className="fill-muted-foreground"
                                        >
                                            {description}
                                        </tspan>
                                    </text>
                                );
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    );
}