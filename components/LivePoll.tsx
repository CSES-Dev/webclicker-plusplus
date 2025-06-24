"use client";
import { Option as PrismaOption, Question as PrismaQuestion, Role } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AnswerOptions from "@/components/ui/answerOptions";
import BackButton from "@/components/ui/backButton";
import QuestionCard from "@/components/ui/questionCard";
import useAccess from "@/hooks/use-access";
import { usePollSocket } from "@/hooks/use-poll-socket";
import { useToast } from "@/hooks/use-toast";

import type { StudentResponseMessage, WebSocketMessage } from "@/lib/websocket";

type QuestionWithOptions = PrismaQuestion & {
    options: PrismaOption[];
};

type fetchCourseSessionQuestionResponse = {
    activeQuestionId: number;
    totalQuestions: number;
};

export default function LivePoll({
    courseSessionId,
}: {
    courseSessionId: number;
}): React.JSX.Element {
    // Extract the course-session-id from the URL
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { data: session } = useSession();

    const courseId = parseInt(params.courseId as string);
    const { hasAccess: _hasAccess, isLoading: isAccessLoading } = useAccess({
        courseId,
        role: Role.STUDENT,
    });

    const [currentQuestion, setCurrentQuestion] = useState<QuestionWithOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [questionCount, setQuestionCount] = useState("1");
    const [_messages, setMessages] = useState<string[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    // Use useRef for activeQuestionId to prevent unnecessary re-renders
    const activeQuestionIdRef = useRef<number | null>(null);

    // Unified state for selected values (either single number or array of numbers)
    const [selectedValues, setSelectedValues] = useState<number | number[] | null>(null);

    // Function to fetch active question - use useCallback to memoize
    const fetchActiveQuestion = useCallback(async () => {
        try {
            // First, get the session to get the activeQuestionId
            const sessionResponse = await fetch(
                `/api/fetchCourseSessionQuestion?sessionId=${courseSessionId}`,
            );

            if (!sessionResponse.ok) {
                return toast({
                    variant: "destructive",
                    description: "Failed to fetch course session",
                });
            }

            const sessionData =
                (await sessionResponse.json()) as fetchCourseSessionQuestionResponse;
            const newActiveQuestionId = sessionData.activeQuestionId;

            // If the active question hasn't changed, don't re-fetch
            if (activeQuestionIdRef.current === newActiveQuestionId) {
                return;
            }

            setLoading(true);

            // Update the ref
            activeQuestionIdRef.current = newActiveQuestionId;

            // If active question ID is 0 or null, no question is active
            if (!newActiveQuestionId) {
                setError("No active question at this time");
                setLoading(false);
                return;
            }

            const questionResponse = await fetch(
                `/api/fetchQuestionById?questionId=${String(newActiveQuestionId)}`,
            );

            if (!questionResponse.ok) {
                toast({ variant: "destructive", description: "Failed to fetch question" });
                router.refresh();
                return;
            }

            const questionData = (await questionResponse.json()) as QuestionWithOptions;
            setCurrentQuestion(questionData);

            // Reset selected values based on question type
            setSelectedValues(questionData.type === "MCQ" ? null : []);

            // Use the position directly from the question object
            // Add 1 since positions typically start at 0 but display to users starts at 1
            const currentNumber = questionData.position + 1;

            setQuestionCount(String(currentNumber));
        } catch (err) {
            toast({ variant: "destructive", description: "An error occurred" });
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [courseSessionId]); // Added dependencies

    // Add this new handler but keep existing code
    const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
        if (data?.type) {
            if (data.type === "question_changed" && "questionId" in data) {
                activeQuestionIdRef.current = null;
                void fetchActiveQuestion();
            } else if (data.type === "response_saved") {
                toast({ description: data.message ?? "Response saved" });
                setSubmitting(false);
            } else if (data.type === "error") {
                toast({
                    variant: "destructive",
                    description: data.message ?? "Error occurred",
                });
                setSubmitting(false);
            } else if (data.type === "connected") {
                console.log("WebSocket connection confirmed:", data.message);
            } else if (data.type === "poll_paused" && "paused" in data) {
                setIsPaused(data.paused);
            }
        }
    }, []);

    // Add this alongside existing WebSocket setup
    const wsRef = usePollSocket({
        courseSessionId,
        userId: session?.user?.id ?? "",
        onMessage: handleWebSocketMessage,
    });

    // Keep existing WebSocket setup
    useEffect(() => {
        void fetchActiveQuestion();
    }, []);

    // Handle loading state
    if ((loading && !currentQuestion) || isAccessLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-custom-background border-opacity-50 rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading question...</p>
                </div>
            </div>
        );
    }

    if (error || !currentQuestion) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center p-6">
                    <p className="text-red-500 mb-4">
                        {error ?? "No active question at this time"}
                    </p>
                    <button
                        onClick={() => {
                            setError(null);
                            void fetchActiveQuestion();
                        }}
                        className="px-4 py-2 bg-custom-background text-white rounded-md mb-4"
                    >
                        Refresh
                    </button>
                    <BackButton href="/dashboard" />
                </div>
            </div>
        );
    }

    // Handle answer selection (works for both MCQ and MSQ)
    const handleSelectionChange = (value: number | number[]): void => {
        setSelectedValues(value);
    };

    const handleSubmit = (): void => {
        if (
            !selectedValues ||
            (Array.isArray(selectedValues) && selectedValues.length === 0) ||
            !currentQuestion ||
            !wsRef.current ||
            wsRef.current.readyState !== WebSocket.OPEN
        ) {
            return;
        }

        try {
            // Set submitting to true BEFORE we do anything else
            setSubmitting(true);

            // Extract option IDs
            const optionIds = Array.isArray(selectedValues) ? selectedValues : [selectedValues];

            // Create message payload
            const message: StudentResponseMessage = {
                type: "student_response",
                questionId: currentQuestion.id,
                optionIds,
            };

            // Send through WebSocket
            wsRef.current.send(JSON.stringify(message));

            // Add to local messages list
            setMessages((prev) => [...prev, `Sent: ${JSON.stringify(message)}`]);

            // Fallback timer in case WebSocket response is never received
            setTimeout(() => {
                if (submitting) {
                    setSubmitting(false);
                    toast({
                        variant: "destructive",
                        description: "Response may not have been saved. Please try again.",
                    });
                }
            }, 5000);
        } catch (submitError: unknown) {
            const errorStr = submitError instanceof Error ? submitError.message : "Unknown error";
            console.error("Error submitting answer:", errorStr);
            toast({ variant: "destructive", description: "Failed to submit answer" });
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-inherit flex flex-col">
            <div className="p-4 sm:p-6 flex flex-col items-center">
                {/* Back Button */}
                <div className="self-start mb-6 mt-2">
                    <BackButton href="/dashboard" />
                </div>

                {/* Connection status */}
                <div className="w-full max-w-[330px] mb-4">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${wsRef.current?.OPEN ? "bg-green-500" : "bg-red-500"}`}
                        />
                        <span>{wsRef.current?.OPEN ? "Connected" : "Disconnected"}</span>
                    </div>
                </div>

                {/* Question header and count */}
                <div className="w-full max-w-[330px]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-[20px] font-medium">Live Question:</h2>
                        <div className="flex items-center">
                            <span className="text-lg">Question {questionCount}</span>
                        </div>
                    </div>
                </div>

                {/* Question Card */}
                <div className="w-full max-w-md">
                    <QuestionCard question={currentQuestion.text} />
                </div>

                {/* Answer Options */}
                <AnswerOptions
                    options={currentQuestion.options}
                    questionType={currentQuestion.type}
                    selectedValues={selectedValues}
                    onSelectionChange={handleSelectionChange}
                />

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={
                        isPaused ||
                        !selectedValues ||
                        (Array.isArray(selectedValues) && selectedValues.length === 0) ||
                        submitting ||
                        !wsRef.current?.OPEN
                    }
                    className={`mt-6 px-6 py-2 rounded-lg text-white font-medium ${
                        submitting ||
                        !selectedValues ||
                        (Array.isArray(selectedValues) && selectedValues.length === 0) ||
                        (isPaused !== undefined && isPaused !== null && isPaused)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    {submitting ? "Submitting..." : isPaused ? "Poll Paused" : "Submit Answer"}
                </button>

                {/* Submission Status - crucial for visual feedback */}
                {submitting && <p className="mt-4 text-blue-500 text-[14px]">Submitting...</p>}

                {isPaused && (
                    <p className="mt-4 text-red-500 text-[14px]">Poll is currently paused.</p>
                )}

                {/* Footer Message */}
                <p className="mt-6 text-[14px] text-gray-500 text-center">
                    Instructor will start the next question shortly...
                </p>
            </div>
        </div>
    );
}
