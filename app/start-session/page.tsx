"use client";
import React, { useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { IconQuestionButton} from "@/components/ui/plus-icon-button"

const chartData = [
    { option: "A.", votes: 200 },
    { option: "B.", votes: 395 },
    { option: "C.", votes: 109 },
    { option: "D.", votes: 75 },
];

const totalVotes = chartData.reduce((sum, item) => sum + item.votes, 0);

const chartConfig = {
    votes: {
        label: "votes",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export default function StartSession() {
    const [date] = useState("June 16th 2024");
    const [questionType, setQuestionType] = useState("Multiple Choice");
    const [question, setQuestion] = useState("Who is your favorite pokemon?");
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
                {date}
            </div>

            {/* Card to hold question and chart */}
            <div className="w-full max-w-4xl">
                <Card>
                    <CardHeader className="border border-[hsl(var(--input-border))] rounded-md">
                        <Badge className=" bg-[#EDEDED] text-[#5C0505] max-w-max mb-2 hover:bg-[none]">{questionType}</Badge>
                        <CardTitle className="text-base md:text-xl">{question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="w-full text-base md:text-l">
                            <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                barCategoryGap={20}
                            >
                                {/* Set the X-axis domain so that the bar length reflects its percentage */}
                                <XAxis type="number" domain={[0, totalVotes]} hide />
                                <YAxis
                                    dataKey="option"
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fill: "#000"}}

                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar
                                    dataKey="votes"
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
                                        dataKey="votes"
                                        position="right"
                                        offset={10}
                                        formatter={(value: number) => {
                                            const percent = (value / totalVotes) * 100;
                                            return `${percent.toFixed(1)}%`;
                                        }}
                                        style={{ fill: "#000", fontSize: 12 }}
                                    />
                                </Bar>
                            </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Next Question Button */}
            <div className="flex items-center justify-end w-full max-w-4xl mt-4 gap-0.25">

                <IconQuestionButton/>
                <Button onClick={handleNextQuestion}> Next Question &gt;</Button>
            </div>
        </div>
    );
}
