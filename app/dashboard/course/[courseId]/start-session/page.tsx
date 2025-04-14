"use client";
import { QuestionType } from "@prisma/client";
import type { Question } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { LetteredYAxisTick } from "@/components/YAxisTick";
import BackButton from "@/components/ui/backButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";
import { IconQuestionButton } from "@/components/ui/plus-icon-button";
import { useToast } from "@/hooks/use-toast";
import { addWildcardQuestion } from "@/lib/server-utils";
import { formatDateToISO } from "@/lib/utils";
import { ChartData } from "@/models/Chart";
import { CourseSessionData, QuestionData } from "@/models/CourseSession";
import { endCourseSession } from "@/services/courseSession";
import {
    getCourseSessionByDate,
    getQuestionById,
    getQuestionsForSession,
} from "@/services/session";

export default function StartSession() {
    const params = useParams();
    const router = useRouter();
    const courseId = parseInt(params.courseId as string);
    const { toast } = useToast();
    const [date] = useState(new Date());
    const utcDate = formatDateToISO(new Date());
    const [courseSession, setCourseSession] = useState<CourseSessionData | null>(null);
    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);
    const [isEndingSession, setIsEndingSession] = useState(false);

    useEffect(() => {
        async function fetchSessionData() {
            const session = await getCourseSessionByDate(courseId, utcDate);
            if (session) {
                setCourseSession({ id: session.id, activeQuestionId: session.activeQuestionId });
                if (session.activeQuestionId !== null) {
                    setActiveQuestionId(session.activeQuestionId);
                }
            } else {
                toast({ description: "No session found" });
                // subject to change (just put this for now goes to 404 maybe it should go to /dashboard?)
                router.push(`/dashboard/course/${courseId}/questionnaire`);
            }
        }
        void fetchSessionData();
    }, [courseId, utcDate, router, toast]);

    // fetch session questions
    const {
        data: questions,
        isLoading: questionsLoading,
        refetch: refetchQuestions,
    } = useQuery<Question[]>(
        ["questions", courseSession?.id],
        () => {
            if (!courseSession) return Promise.resolve([]);
            return getQuestionsForSession(courseSession.id);
        },
        { enabled: !!courseSession },
    );

    // scenario when questions load and no active question is set, we will default to the first question
    useEffect(() => {
        if (questions && questions.length > 0 && activeQuestionId === null) {
            setActiveQuestionId(questions[0].id);
            if (courseSession) {
                fetch(`/api/session/${courseSession.id}/activeQuestion`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activeQuestionId: questions[0].id }),
                }).catch((err: unknown) => {
                    console.error("Error updating active question:", err);
                });
            }
        }
    }, [questions, activeQuestionId, courseSession]);

    // retrieve details of the active question
    const { data: questionData } = useQuery<QuestionData | null>(
        ["question", activeQuestionId],
        () => (activeQuestionId ? getQuestionById(activeQuestionId) : Promise.resolve(null)),
        { refetchInterval: 2000, enabled: !!activeQuestionId },
    );

    const totalQuestions = questions?.length ?? 0;

    const activeIndex = questions ? questions.findIndex((q) => q.id === activeQuestionId) : -1;
    const isLastQuestion = activeIndex === totalQuestions - 1;

    const chartData: ChartData[] = questionData
        ? questionData.options.map((option: { id: number; text: string }) => ({
              option: option.text,
              Votes: questionData.responses.filter(
                  (resp: { optionId: number }) => resp.optionId === option.id,
              ).length,
          }))
        : [];

    const handleNextQuestion = useCallback(async () => {
        if (questions && activeIndex !== -1 && activeIndex < totalQuestions - 1 && courseSession) {
            const nextQuestionID = questions[activeIndex + 1].id;
            setActiveQuestionId(nextQuestionID);
            try {
                const response = await fetch(`/api/session/${courseSession.id}/activeQuestion`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activeQuestionId: nextQuestionID }),
                });
                if (!response.ok) {
                    toast({ variant: "destructive", description: "Error updating question" });
                    console.error("Failed to update active question in DB", response);
                }
            } catch (err: unknown) {
                toast({ variant: "destructive", description: "Error updating question" });
                console.error("Error updating active question:", err);
            }
        }
    }, [activeIndex, questions, totalQuestions, courseSession, toast]);

    const handleAddWildcard = useCallback(
        async (selectedType: QuestionType) => {
            if (!courseSession) {
                console.error("No course session found for this course and date");
                return;
            }
            setIsAddingQuestion(true); // disable button
            const index = questions ? questions.findIndex((q) => q.id === activeQuestionId) : -1;
            const position = index !== -1 ? index + 1 : questions ? questions.length + 1 : 1;
            try {
                await addWildcardQuestion(courseSession.id, position, selectedType);
                await refetchQuestions(); // refetch the questions query so the new question appears immediately without the need of a manual refresh
            } catch (error: unknown) {
                toast({ variant: "destructive", description: "Failed to add question" });
                console.error(error);
            } finally {
                setIsAddingQuestion(false); // re-enable the button
            }
        },
        [activeQuestionId, courseSession, questions, refetchQuestions, toast],
    );

    const handleEndPoll = useCallback(async () => {
        if (!courseSession) return;

        setIsEndingSession(true);
        try {
            await endCourseSession(courseSession.id, new Date());
            // Once the session is ended, navigate away - subject to change (just put this for now goes to 404 maybe it should go to /dashboard?)
            router.push(`/dashboard/course/${courseId}/questionnaire`);
        } catch (error) {
            toast({ variant: "destructive", description: "Failed to end session" });
            console.error(error);
        } finally {
            setIsEndingSession(false);
        }
    }, [courseSession, courseId, router, toast]);

    const chartConfig: ChartConfig = {
        Votes: {
            label: "Votes",
            color: "hsl(var(--chart-1))",
        },
    };

    if (!courseSession || questionsLoading) {
        return <GlobalLoadingSpinner />;
    }

    const activeQuestion = questions ? questions.find((q) => q.id === activeQuestionId) : null;
    const totalVotes = questionData ? new Set(questionData.responses.map((resp) => resp.userId)).size : 0;

    return (
        <div className="flex flex-col items-center p-4">
            {/* Top row with Back button and date */}
            <div className="flex justify-between w-full mb-4 text-2xl">
                <BackButton href={`/dashboard/course/${courseId}/questionnaire`} />
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
                        <ChartContainer
                            config={chartConfig}
                            className="w-full text-base md:text-lg"
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={chartData}
                                    layout="vertical"
                                    barCategoryGap={20}
                                    margin={{ left: 100, right: 20, top: 20, bottom: 20 }}
                                >
                                    <XAxis type="number" domain={[0, totalVotes]} hide />
                                    <YAxis
                                        dataKey="option"
                                        type="category"
                                        tick={<LetteredYAxisTick />}
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
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
                        onClick={() => void handleEndPoll()}
                        disabled={isEndingSession || isAddingQuestion}
                    >
                        End Poll
                    </Button>
                ) : (
                    <Button onClick={() => void handleNextQuestion()} disabled={isAddingQuestion}>
                        Next Question &gt;
                    </Button>
                )}
            </div>
        </div>
    );
}
