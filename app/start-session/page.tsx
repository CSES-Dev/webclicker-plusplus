"use client";
import React, { useState } from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

// Fake data
const chartData = [
    { option: "Pikachu", desktop: 186 },
    { option: "Squirtle", desktop: 305 },
    { option: "Charmander", desktop: 237 },
    { option: "Mewtwo", desktop: 73 },
];
const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export default function StartSession() {
    const [date, _setDate] = useState("Month Day, Year");
    const [questionType, _setQuestionType] = useState("Multiple Choice");
    const [question, _setQuestion] = useState("Who is Ash's Partner in Pokemon?");
    const [choices] = useState(["Pikachu", "Pikachu", "Pikachu", "Pikachu"]);
    //const [_questionNumber, _setQuestionNumber] = useState(1);

    return (
        <div className="flex flex-col justify-between items-center">
            {/* Button  */}
            <div className="flex justify-between w-full">
                <Button>&lt; Back</Button>
                <p>{date}</p>
            </div>
            {/* Question  */}
            <div className="flex flex-col justify-start w-3/4 border border-[hsl(var(--input-border))] rounded-md">
                <Badge className="max-w-max">{questionType}</Badge>
                <p>{question}</p>
            </div>

            {/* Answer choice */}
            {/* <div className="flex flex-col justify-start w-3/4">
                <p>{choices[0]}</p>
                <p>{choices[1]}</p>
                <p>{choices[2]}</p>
                <p>{choices[3]}</p>
            </div> */}
            <div className="space-y-4 mb-6"></div>
            <div className="w-full max-w-4xl mt-8">
                <Card>
                    <CardHeader className="border border-[hsl(var(--input-border))] rounded-md">
                        <CardTitle>Who is Ash's Partner in Pokemon?</CardTitle>
                        <CardDescription>June 16th 2024</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <BarChart
                                accessibilityLayer
                                data={chartData}
                                layout="vertical"
                                margin={{
                                    left: -20,
                                }}
                            >
                                <XAxis type="number" dataKey="desktop" hide />
                                <YAxis
                                    dataKey="option"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                    hide
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar
                                    dataKey="desktop"
                                    fill="#F3AB7E"
                                    background={{
                                        fill: "#ffffff",
                                        stroke: "#959595",
                                        strokeWidth: 0.5,
                                        radius: 10,
                                    }}
                                    radius={10}
                                    barSize={30}
                                >
                                    <LabelList
                                        dataKey="option"
                                        position="top"
                                        offset={10}
                                        className="fill-[--color-label]"
                                        fontSize={12}
                                    />
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            {/* A , B , C,
            We get all data first - reason is less load time versus getting data each time next question button pressed 
            page 0 - 5 (A)
            page 10 - 15 (B) - professor adds a question 
            page 15 - 20 (C)
            - - - - - + 1 -> 5/6 
             */}
            <div className="flex">
                <p>question progress</p>
            </div>
            {/* Button (make next thing turn live) */}
            <div className="flex justify-end w-3/4">
                <Button>Next Question &gt;</Button>
            </div>
        </div>
    );
}
