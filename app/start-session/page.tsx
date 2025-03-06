"use client";
import { QuestionType } from "@prisma/client";
import type { Question } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
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
import { ChartData } from "@/models/Chart";
import { CourseSessionData, QuestionData } from "@/models/CourseSession";
import {
    getCourseSessionByDate,
    getQuestionById,
    getQuestionsForSession,
} from "@/services/session";

export default function StartSession(/*{ courseId }: StartSessionProps*/) {
    const [date] = useState(new Date());
    const [courseSession, setCourseSession] = useState<CourseSessionData | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

    const courseId = 19; // hardcoded for now
    const router = useRouter();
    const utcDate = date.toISOString();

    // get course session and questions on initial load.
    useEffect(() => {
        async function fetchSessionData() {
            const session = await getCourseSessionByDate(courseId, utcDate);
            if (session) {
                setCourseSession({
                    id: session.id,
                    activeQuestionId: session.activeQuestionId,
                });
                const sessionQs = await getQuestionsForSession(session.id);
                setQuestions(sessionQs);
                setTotalQuestions(sessionQs.length);
                if (session.activeQuestionId === null && sessionQs.length > 0) {
                    const firstQuestionId = sessionQs[0].id;
                    setActiveQuestionId(firstQuestionId);
                    // Retrieve the activeQuestioId if reload occurs
                    try {
                        const response = await fetch(`/api/session/${session.id}/activeQuestion`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ activeQuestionId: firstQuestionId }),
                        });
                        if (!response.ok) {
                            console.error("Failed to update active question in DB");
                        }
                    } catch (err) {
                        console.error("Error updating active question:", err);
                    }
                } else {
                    setActiveQuestionId(session.activeQuestionId);
                }
            }
        }
        void fetchSessionData();
    }, [courseId, utcDate]);

    // cache the active question data.
    const { data: questionData } = useQuery<QuestionData | null>(
        ["question", activeQuestionId],
        () => (activeQuestionId ? getQuestionById(activeQuestionId) : Promise.resolve(null)),
        {
            refetchInterval: 2000,
            enabled: !!activeQuestionId,
        },
    );

    // memoize chart data to avoid unnecessary recalculations.
    const chartData: ChartData[] = useMemo(() => {
        if (!questionData) return [];
        return questionData.options.map((option: { id: number; text: string }) => ({
            option: option.text,
            Votes: questionData.responses.filter(
                (resp: { optionId: number }) => resp.optionId === option.id,
            ).length,
        }));
    }, [questionData]);

    const handleNextQuestion = useCallback(async () => {
        const index = questions.findIndex((q) => q.id === activeQuestionId);
        if (index !== -1 && index < totalQuestions - 1 && courseSession) {
            const nextQuestionID = questions[index + 1].id;
            setActiveQuestionId(nextQuestionID);
            // update activeQuestionId in database
            try {
                const response = await fetch(`/api/session/${courseSession.id}/activeQuestion`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activeQuestionId: nextQuestionID }),
                });
                if (!response.ok) {
                    console.error("Failed to update active question in DB");
                }
            } catch (err) {
                console.error("Error updating active question:", err);
            }
        }
    }, [activeQuestionId, questions, totalQuestions, courseSession]);

    const handleAddWildcard = useCallback(
        async (selectedType: QuestionType) => {
            if (!courseSession) {
                console.error("No course session found for this course and date");
                return;
            }
            const index = questions.findIndex((q) => q.id === activeQuestionId);
            const position = index !== -1 ? index + 1 : questions.length + 1;
            try {
                // create wildcard question
                const res = await fetch(`/api/session/${courseSession.id}/wildcard`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ position, questionType: selectedType }),
                });
                if (!res.ok) {
                    throw new Error("Failed to add wildcard question");
                }
                const newQuestion = (await res.json()) as Question;
                console.log("Wildcard question created:", newQuestion);
            } catch (error) {
                console.error(error);
            }
        },
        [activeQuestionId, courseSession, questions],
    );

    const totalVotes = chartData.reduce((sum, item) => sum + item.Votes, 0);
    const activeQuestion = questions.find((q) => q.id === activeQuestionId);
    const isLastQuestion =
        questions.findIndex((q) => q.id === activeQuestionId) === totalQuestions - 1;

    const handleEndPoll = useCallback(() => {
        router.push("/dashboard"); // go to dashboard can change though
    }, [router]);

    const chartConfig: ChartConfig = {
        Votes: {
            label: "Votes",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <div className="flex flex-col items-center p-4">
            {/* Top row with Back button and date */}
            <div className="flex justify-between w-full mb-4">
                <Button className="bg-[#18328D] text-white" variant="outline">
                    &lt; Back
                </Button>
                {date.toDateString()}
            </div>

            {/* Card with question and chart */}
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
                                                if (!totalVotes || !value) return "0%";
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
                <IconQuestionButton
                    onSelect={(selectedType) => void handleAddWildcard(selectedType)}
                />
                {isLastQuestion ? (
                    <Button
                        onClick={() => {
                            handleEndPoll();
                        }}
                    >
                        End Poll
                    </Button>
                ) : (
                    <Button onClick={() => void handleNextQuestion()}>Next Question &gt;</Button>
                )}
            </div>
        </div>
    );
}
