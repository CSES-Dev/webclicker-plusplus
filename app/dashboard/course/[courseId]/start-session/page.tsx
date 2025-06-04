"use client";
import { QuestionType } from "@prisma/client";
import type { Question } from "@prisma/client";
import { EyeOff, PauseCircleIcon, PlayCircleIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_SHOW_RESULTS } from "@/lib/constants";
import { addWildcardQuestion } from "@/lib/server-utils";
import { formatDateToISO, shuffleArray } from "@/lib/utils";
import { CourseSessionData, QuestionData } from "@/models/CourseSession";
import { endCourseSession, pauseOrResumeCourseSession } from "@/services/courseSession";
import {
    getCourseSessionByDate,
    getQuestionById,
    getQuestionsForSession,
} from "@/services/session";

import { StartSessionWebSocketMessage } from "@/lib/websocket"

interface ResponseCountsData {
    optionCounts?: Record<number, number>;
    responseCount?: number;
}

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
    const [_totalResponses, setTotalResponses] = useState(0);
    const wsRef = useRef<WebSocket | null>(null);
    const sessionData = useSession();
    const [isPaused, setIsPaused] = useState(false);
    const [isChangingQuestion, setIsChangingQuestion] = useState(false);
    const [showResults, setShowResults] = useState(DEFAULT_SHOW_RESULTS);
    const [allResponseCounts, setAllResponseCounts] = useState<
        Record<string, Record<number, number>>
    >({});

    useEffect(() => {
        async function fetchSessionData() {
            const sessionResult = await getCourseSessionByDate(courseId, utcDate);
            if (sessionResult) {
                setCourseSession({
                    id: sessionResult.id,
                    activeQuestionId: sessionResult.activeQuestionId,
                });
                if (sessionResult.activeQuestionId !== null) {
                    setActiveQuestionId(sessionResult.activeQuestionId);
                }
            } else {
                toast({ description: "No session found" });
                // subject to change (just put this for now goes to 404 maybe it should go to /dashboard?)
                router.push(`/dashboard/course/${courseId}/questionnaire`);
            }
        }
        void fetchSessionData();
    }, [courseId, utcDate, router, toast]);

    const { data: questionData } = useQuery<QuestionData | null>(
        ["question", activeQuestionId],
        () => (activeQuestionId ? getQuestionById(activeQuestionId) : Promise.resolve(null)),
        { enabled: !!activeQuestionId },
    );

    // Setup WebSocket connection
    useEffect(() => {
        if (!courseSession || !sessionData.data?.user?.id) return;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(
            `${protocol}//${window.location.host}/ws/poll?sessionId=${courseSession.id}&userId=${sessionData.data.user.id}`,
        );
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection established");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data as string) as StartSessionWebSocketMessage;
                console.log("Received WebSocket message:", data);

                if (data.type === "response_update") {
                    console.log("Updating response counts:", data.optionCounts);
                    if (
                        data.optionCounts &&
                        data.questionId !== undefined &&
                        data.questionId !== null
                    ) {
                        setAllResponseCounts(
                            (prev) =>
                                ({
                                    ...prev,
                                    [String(data.questionId)]: data.optionCounts ?? {},
                                }) as Record<string, Record<number, number>>,
                        );
                    }
                    if (data.responseCount) {
                        setTotalResponses(data.responseCount);
                    }
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [courseSession, sessionData.data?.user?.id]);

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
                }).catch((error: unknown) => {
                    console.error("Error updating active question:", error);
                });
            }
        }
    }, [questions, activeQuestionId, courseSession]);

    const totalQuestions = questions?.length ?? 0;

    const activeIndex = questions ? questions.findIndex((q) => q.id === activeQuestionId) : -1;
    const isLastQuestion = activeIndex === totalQuestions - 1;

    // Update chart data to use WebSocket updates
    const shuffledOptions = useMemo(
        () => (questionData ? shuffleArray(questionData.options) : []),
        [activeQuestionId, questionData?.options],
    );

    const chartData = shuffledOptions.map((option) => ({
        option: option.text,
        Votes: (activeQuestionId && allResponseCounts[String(activeQuestionId)]?.[option.id]) ?? 0,
    }));

    const totalVotes = chartData.reduce((sum, item) => sum + item.Votes, 0);

    const handleNextQuestion = useCallback(async () => {
        if (questions && activeIndex !== -1 && activeIndex < totalQuestions - 1 && courseSession) {
            setIsChangingQuestion(true);
            const nextQuestionID = questions[activeIndex + 1].id;
            setActiveQuestionId(nextQuestionID);
            try {
                const response = await fetch(`/api/session/${courseSession.id}/activeQuestion`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activeQuestionId: nextQuestionID }),
                });
                if (response.ok) {
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(
                            JSON.stringify({
                                type: "active_question_update",
                                questionId: nextQuestionID,
                                courseSessionId: courseSession.id,
                            }),
                        );
                        console.log("Sent active_question_update via WebSocket (next)");
                    }
                }
            } catch {
                toast({ variant: "destructive", description: "Error updating question" });
            }
            setIsChangingQuestion(false);
        }
    }, [activeIndex, questions, totalQuestions, courseSession, toast]);

    const handlePreviousQuestion = useCallback(async () => {
        if (questions && activeIndex > 0 && courseSession) {
            setIsChangingQuestion(true);
            const prevQuestionID = questions[activeIndex - 1].id;
            setActiveQuestionId(prevQuestionID);
            try {
                const response = await fetch(`/api/session/${courseSession.id}/activeQuestion`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activeQuestionId: prevQuestionID }),
                });
                if (response.ok) {
                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(
                            JSON.stringify({
                                type: "active_question_update",
                                questionId: prevQuestionID,
                                courseSessionId: courseSession.id,
                            }),
                        );
                        console.log("Sent active_question_update via WebSocket (prev)");
                    }
                }
            } catch {
                toast({ variant: "destructive", description: "Error updating question" });
            }
            setIsChangingQuestion(false);
        }
    }, [activeIndex, questions, courseSession, toast]);

    const handleQuestionSelect = useCallback(
        async (questionId: string) => {
            if (courseSession) {
                setIsChangingQuestion(true);
                const selectedQuestionId = parseInt(questionId);
                setActiveQuestionId(selectedQuestionId);
                try {
                    const response = await fetch(
                        `/api/session/${courseSession.id}/activeQuestion`,
                        {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ activeQuestionId: selectedQuestionId }),
                        },
                    );
                    if (response.ok) {
                        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                            wsRef.current.send(
                                JSON.stringify({
                                    type: "active_question_update",
                                    questionId: selectedQuestionId,
                                    courseSessionId: courseSession.id,
                                }),
                            );
                            console.log("Sent active_question_update via WebSocket (select)");
                        }
                    }
                } catch {
                    toast({ variant: "destructive", description: "Error updating question" });
                }
                setIsChangingQuestion(false);
            }
        },
        [courseSession, toast],
    );

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

    const handlePauseResume = useCallback(
        async (pauseState: boolean) => {
            if (!courseSession) return;
            setIsPaused(pauseState);
            try {
                await pauseOrResumeCourseSession(courseSession.id, pauseState);
                wsRef.current?.send(JSON.stringify({ type: "pause_poll", paused: pauseState }));
            } catch (error) {
                toast({
                    variant: "destructive",
                    description: `Failed to ${pauseState ? "pause" : "resume"} session`,
                });
                console.error(error);
            }
        },
        [courseSession, toast],
    );

    const chartConfig: ChartConfig = {
        Votes: {
            label: "Votes",
            color: "hsl(var(--chart-1))",
        },
    };

    // Updates chart if professor window refreshes
    useEffect(() => {
        if (!activeQuestionId) return;

        fetch(`/api/getResponseCounts?questionId=${activeQuestionId}`)
            .then((res) => res.json())
            .then((data: ResponseCountsData) => {
                if (
                    data.optionCounts &&
                    typeof activeQuestionId === "number" &&
                    !isNaN(activeQuestionId)
                ) {
                    setAllResponseCounts(
                        (prev) =>
                            ({
                                ...prev,
                                [String(activeQuestionId)]: data.optionCounts ?? {},
                            }) as Record<string, Record<number, number>>,
                    );
                }
                if (data.responseCount) {
                    setTotalResponses(data.responseCount);
                }
            })
            .catch((error: unknown) => {
                console.error("Failed to fetch response counts:", error);
            });
    }, [activeQuestionId]);

    if (!courseSession || questionsLoading) {
        return <GlobalLoadingSpinner />;
    }

    const activeQuestion = questions ? questions.find((q) => q.id === activeQuestionId) : null;

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
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <span>
                                Question {activeIndex !== -1 ? activeIndex + 1 : 0} of{" "}
                                {totalQuestions}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {chartData.length > 0 ? (
                            <ChartContainer
                                config={chartConfig}
                                className="w-full text-base md:text-lg"
                            >
                                <ResponsiveContainer width="100%" height={300}>
                                    {showResults ? (
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
                                    ) : (
                                        <div className="w-full h-full bg-muted flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                                            <EyeOff className="w-10 h-10" />
                                            <p className="text-sm font-medium">
                                                Poll results are hidden
                                            </p>
                                        </div>
                                    )}
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                No responses yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Question Selector Dropdown */}
            <div className="w-full max-w-4xl mt-4">
                <Select
                    value={activeQuestionId?.toString()}
                    onValueChange={(value) => {
                        void handleQuestionSelect(value);
                    }}
                    disabled={
                        !questions ||
                        questions.length === 0 ||
                        isChangingQuestion ||
                        isAddingQuestion
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Jump to question..." />
                    </SelectTrigger>
                    <SelectContent>
                        {questions?.map((question, index) => (
                            <SelectItem key={question.id} value={question.id.toString()}>
                                Question {index + 1}:{" "}
                                {question.text.length > 30
                                    ? `${question.text.substring(0, 30)}...`
                                    : question.text}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Navigation and Control Buttons */}
            <div className="flex items-center justify-between w-full max-w-4xl mt-4 gap-2">
                <div>
                    <Button
                        onClick={() => void handlePreviousQuestion()}
                        disabled={activeIndex <= 0 || isAddingQuestion || isChangingQuestion}
                        variant="outline"
                    >
                        &lt; Previous Question
                    </Button>
                </div>
                <Button
                    onClick={() => {
                        setShowResults((prev: boolean) => !prev);
                    }}
                >
                    {showResults ? "Hide" : "Show"}
                </Button>
                <div className="flex gap-2">
                    {isPaused ? (
                        <button className="w-fit h-10 transition-transform hover:scale-110 cursor-pointer">
                            <PlayCircleIcon
                                size={28}
                                strokeWidth={1.5}
                                onClick={() => {
                                    void handlePauseResume(!isPaused);
                                }}
                            />
                        </button>
                    ) : (
                        <button className="w-fit h-10 transition-transform hover:scale-110 cursor-pointer">
                            <PauseCircleIcon
                                size={28}
                                strokeWidth={1.5}
                                onClick={() => {
                                    void handlePauseResume(!isPaused);
                                }}
                            />
                        </button>
                    )}
                    <IconQuestionButton
                        onSelect={(selectedType) => {
                            // Only proceed if not currently changing a question
                            if (!isChangingQuestion) {
                                void handleAddWildcard(selectedType);
                            }
                        }} // Also disable the add button during navigation
                    />
                    {isLastQuestion ? (
                        <Button
                            onClick={() => void handleEndPoll()}
                            disabled={isEndingSession || isAddingQuestion || isChangingQuestion}
                        >
                            End Poll
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                void handleNextQuestion();
                            }}
                            disabled={isAddingQuestion || isChangingQuestion}
                        >
                            Next Question &gt;
                        </Button>
                    )}
                </div>{" "}
            </div>
        </div>
    );
}
