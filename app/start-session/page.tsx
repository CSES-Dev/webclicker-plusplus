"use client";
import { QuestionType } from "@prisma/client";
import type { Question } from "@prisma/client";
import React, { useEffect, useState } from "react";
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
import { IconQuestionButton } from "@/components/ui/plus-icon-button";
import { getCourseSessionByDate, getQuestionsForSession, getQuestionById } from "@/services/session";
import { ChartData } from "@/models/Chart"


export default function StartSession() {
    const [date] = useState(new Date());
    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [_, setCourseSessionId] = useState<number | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);

    const utcDate = date.toISOString();
    const courseId = 19; // Need to make dynamic hardcoded for now

    
    useEffect(() => {
        async function fetchCourseSession() {
            const courseSession = await getCourseSessionByDate(courseId, utcDate);
            console.log(courseSession);



            if (courseSession) {
                setCourseSessionId(courseSession.id);
                console.log("courseSessionID =", courseSession.id);
                
                const sessionQuestions = await getQuestionsForSession(courseSession.id);
                setQuestions(sessionQuestions);
                console.log("questions =", sessionQuestions);
                
                setTotalQuestions(sessionQuestions.length);
                console.log("totalQuestions =", sessionQuestions.length);
                
                // active question check db to see if active question is present should make this null because it will be 0 when created 
                // make activeQuestion optional it can be null so on our first go around we know that we trying to fetch the "First" question 
                // aka smallest position number (0) - else if sttement
                //  if statement if we refreseht we can just check the databasae for the activeQuestionId and set our variable up 
                if (courseSession.activeQuestionId) {
                    setActiveQuestionId(courseSession.activeQuestionId);
                } else if (sessionQuestions.length > 0) {
                setActiveQuestionId(sessionQuestions[0].id);
                }
            }
        }
        fetchCourseSession();
    }, [courseId, date]); 

    const handleNextQuestion = () => {
        const index = questions.findIndex((q) => q.id === activeQuestionId);

        // Check if the current question index is valid and less than totalQuestions - 1
        if (index !== -1 && index < totalQuestions - 1) {
            const nextQuestionID = questions[index + 1].id;
            setActiveQuestionId(nextQuestionID);
            console.log("activeQuestionId (after state update) =", nextQuestionID);
        }
    };

    //  handler to add a wildcard question.
    const handleAddWildcard = async (selectedType: QuestionType) => {
        const courseSession = await getCourseSessionByDate(courseId, utcDate);
        if (!courseSession) {
            console.error("No course session found for this course and date");
            return; 
        }
        setCourseSessionId(courseSession.id);
        const index = questions.findIndex(q => q.id === activeQuestionId);
        const position = index !== -1 ? index + 1 : questions.length + 1;

        try {
            const res = await fetch(`/api/session/${courseSession.id}/wildcard`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ position, questionType: selectedType }),
            });
            if (!res.ok) {
                throw new Error("Failed to add wildcard question");
            }
            const newQuestion = await res.json();
            console.log("Wildcard question created:", newQuestion);
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        if (!activeQuestionId) return;
        const fetchUpdatedQuestion = async () => {
            const updatedQuestion = await getQuestionById(activeQuestionId);
            if (updatedQuestion) {
                const newChartData: ChartData[] = updatedQuestion.options.map(option => ({
                    option: option.text,
                    Votes: updatedQuestion.responses.filter(resp => resp.optionId === option.id).length
                }));
                setChartData(newChartData);
            }
        };

        // update chart every 2 seconds.
        fetchUpdatedQuestion();
        const interval = setInterval(fetchUpdatedQuestion, 2000);
        return () => clearInterval(interval);
    }, [activeQuestionId]);

    const totalVotes = chartData.reduce((sum, item) => sum + item.Votes, 0);
    const activeQuestion = questions.find((q) => q.id === activeQuestionId);


    const chartConfig: ChartConfig = {
        Votes: {
            label: "Votes",
            color: "hsl(var(--chart-1))",
        },
    };


    return (
        <div className="flex flex-col items-center p-4">
            {/* Top row with Back button + date */}
            <div className="flex justify-between w-full mb-4">
                <Button className="bg-[#18328D] text-white" variant="outline">
                    &lt; Back
                </Button>
                {date.toDateString()}
            </div>

            {/* Card to hold question and chart */}
            <div className="w-full max-w-4xl">
                <Card>
                    <CardHeader className="border border-[hsl(var(--input-border))] rounded-md">
                        <Badge className="bg-[#EDEDED] text-[#5C0505] max-w-max mb-2 hover:bg-[none]">
                            {activeQuestion?.type}
                        </Badge>
                        <CardTitle className="text-base md:text-xl">
                            {activeQuestion?.text}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="w-full text-base md:text-l">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData} layout="vertical" barCategoryGap={20}>
                                    <XAxis type="number" domain={[0, totalVotes]} hide />
                                    <YAxis
                                        dataKey="option"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        style={{ fill: "#000" }}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar
                                        dataKey="Votes"
                                        fill="#F3AB7E"
                                        barSize={30}
                                        radius={[5, 5, 5, 5]}
                                        background={{
                                            fill: "#fff",
                                            stroke: "#959595",
                                            strokeWidth: 0.5,
                                            radius: 5,
                                        }}
                                    >
                                        <LabelList
                                            dataKey="Votes"
                                            position="right"
                                            offset={10}
                                            formatter={(value: number) => {
                                                const total = chartData.reduce((sum, item) => sum + item.Votes, 0);
                                                if (!total || !value) {
                                                    return "0%";
                                                }
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

            {/* Next Question and Wildcard Button */}
            <div className="flex items-center justify-end w-full max-w-4xl mt-4 gap-2">
                <IconQuestionButton onSelect={handleAddWildcard} />
                <Button onClick={handleNextQuestion}>Next Question &gt;</Button>
            </div>
        </div>
    );
}
