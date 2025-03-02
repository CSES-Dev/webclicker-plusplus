"use client";
import React, { useState } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
    { option: "Pikachu", desktop: 200 },
    { option: "Squirtle", desktop: 395 },
    { option: "Charmander", desktop: 109 },
    { option: "Mewtwo", desktop: 75 },
];

const totalVotes = chartData.reduce((sum, item) => sum + item.desktop, 0);

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export default function StartSession() {
    const [date] = useState("June 16th 2024");
    const [questionType] = useState("Multiple Choice");
    const [question] = useState("Who is Ash's Partner in Pokemon?");

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const totalQuestions = 3;

    const handleNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    return (
        <div className="flex flex-col items-center p-4">
            {/* Top row with Back button + date */}
            <div className="flex justify-between w-full mb-4">
                <Button className="bg-[#18328D] text-white" variant="outline">&lt; Back</Button>
            </div>

            {/* Card to hold question and chart */}
            <div className="w-full max-w-4xl">
                <Card>
                    <CardHeader className="border border-[hsl(var(--input-border))] rounded-md">
                        <Badge className="max-w-max mb-2">{questionType}</Badge>
                        <CardTitle>{question}</CardTitle>
                        <CardDescription>{date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 20, right: 100, left: 80, bottom: 20 }}
                                barCategoryGap={20}
                            >
                                {/* Set the X-axis domain so that the bar length reflects its percentage */}
                                <XAxis type="number" domain={[0, totalVotes]} hide />
                                <YAxis
                                    dataKey="option"
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar
                                    dataKey="desktop"
                                    fill="#F3AB7E"
                                    barSize={30}
                                    // Apply rounded corners to both the bar and its background
                                    radius={[5, 5, 5, 5]}
                                    background={{
                                        fill: "#fff",
                                        stroke: "#959595",
                                        strokeWidth: 0.5,
                                        radius: 5,
                                    }}
                                >
                                    <LabelList
                                        dataKey="desktop"
                                        position="right"
                                        offset={10}
                                        formatter={(value) => {
                                            const percent = (value / totalVotes) * 100;
                                            return `${percent.toFixed(1)}%`;
                                        }}
                                        style={{ fill: "#000", fontSize: 12 }}
                                    />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 3-dot progress indicator */}
            <div className="mt-6">
                <div className="flex items-center space-x-2">
                    {Array.from({ length: totalQuestions }, (_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                                i === currentQuestionIndex ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Next Question Button */}
            <div className="flex justify-end w-full max-w-4xl mt-4">
                <Button onClick={handleNextQuestion}>Next Question &gt;</Button>
            </div>
        </div>
    );
}
