"use client";
import { Option as PrismaOption, Question as PrismaQuestion } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AnswerOptions from "@/components/ui/answerOptions";
import BackButton from "@/components/ui/backButton";
import QuestionCard from "@/components/ui/questionCard";
import useAccess from "@/hooks/use-access";
import { useToast } from "@/hooks/use-toast";

import { getSessionPauseState } from "@/services/courseSession";

type QuestionWithOptions = PrismaQuestion & {
    options: PrismaOption[];
};

type fetchCourseSessionQuestionResponse = {
    activeQuestionId: number;
    totalQuestions: number;
};

// Define proper types for WebSocket messages
type WebSocketMessageType =
    | "connected"
    | "response_saved"
    | "question_changed"
    | "response_update"
    | "error"
    | "echo"
    | "binary"
    | "student_response";

interface WebSocketMessageBase {
    type: WebSocketMessageType;
    message?: string;
}

interface QuestionChangedMessage extends WebSocketMessageBase {
    type: "question_changed";
    questionId: number;
}

interface ResponseSavedMessage extends WebSocketMessageBase {
    type: "response_saved";
    message?: string;
}

interface StudentResponseMessage extends WebSocketMessageBase {
    type: "student_response";
    questionId: number;
    optionIds: number[];
}

// Union type for all message types
type WebSocketMessage =
    | QuestionChangedMessage
    | ResponseSavedMessage
    | StudentResponseMessage
    | WebSocketMessageBase;

export default function LivePoll({
    courseSessionId,
}: {
    courseSessionId: number;
}): React.JSX.Element {
    // Extract the course-session-id from the URL
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const courseId = parseInt(params.courseId as string);
    const { hasAccess: _hasAccess, isLoading: isAccessLoading } = useAccess({
        courseId,
        role: "STUDENT",
    });

    const [currentQuestion, setCurrentQuestion] = useState<QuestionWithOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [questionCount, setQuestionCount] = useState("1");
    const [isConnected, setIsConnected] = useState(false);
    const [_messages, setMessages] = useState<string[]>([]);

    // Use useRef for activeQuestionId to prevent unnecessary re-renders
    const activeQuestionIdRef = useRef<number | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

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
    }, [courseSessionId, toast, router]); // Added dependencies

    // Setup WebSocket connection
    useEffect(() => {
        if (!courseSessionId) return;

        // Generate a temporary user ID for testing
        // In a real app, you would use the authenticated user's ID
        const tempUserId = `test-user-${Math.floor(Math.random() * 1000)}`;

        // Create WebSocket connection
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const ws = new WebSocket(
            `${protocol}//${window.location.host}/ws/poll?sessionId=${courseSessionId}&userId=${tempUserId}`,
        );
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connection established");
            setIsConnected(true);
            setMessages((prev) => [...prev, "Connected to WebSocket"]);
        };

        ws.onmessage = (event) => {
            let data: WebSocketMessage | null = null;
            let messageText = "";

            // Display the raw message for debugging
            console.log("Raw message received:", event.data);

            // Try to parse as JSON, but handle plain text too
            try {
                if (typeof event.data === "string") {
                    try {
                        // Try to parse as JSON
                        data = JSON.parse(event.data) as WebSocketMessage;
                        messageText = `Received JSON: ${JSON.stringify(data)}`;
                        console.log("Parsed JSON:", data);

                        // Process valid JSON message
                        if (data?.type) {
                            // Fixed with optional chaining
                            // Type guard for question_changed
                            if (data.type === "question_changed" && "questionId" in data) {
                                // Refresh the question when the instructor changes it
                                activeQuestionIdRef.current = null; // Force refresh
                                void fetchActiveQuestion();
                            } else if (data.type === "response_saved") {
                                toast({ description: data.message ?? "Response saved" }); // Fixed with nullish coalescing
                                setSubmitting(false); // Reset submitting state on success
                            } else if (data.type === "error") {
                                toast({
                                    variant: "destructive",
                                    description: data.message ?? "Error occurred", // Fixed with nullish coalescing
                                });
                                setSubmitting(false); // Reset submitting state on error
                            } else if (data.type === "connected") {
                                console.log("WebSocket connection confirmed:", data.message);
                            } else if (data.type === "echo") {
                                console.log("Server echo:", data.message);
                                // This is likely a text response echoed back
                                // We can safely ignore this for the student response flow
                            }
                        }
                    } catch (_) {
                        // Fixed unused variable
                        // This is from the old server - we need to handle this format
                        const message = event.data;
                        messageText = `Received text: ${message}`;

                        // Check if this is a response to our student submission
                        if (
                            typeof message === "string" &&
                            message.includes("student_response") &&
                            submitting
                        ) {
                            // This is likely a response to our student submission
                            toast({ description: "Your answer has been recorded" });
                            setSubmitting(false); // Reset submitting state
                        }
                    }
                } else {
                    // Handle binary data if needed
                    data = {
                        type: "binary",
                        message: "Binary data received",
                    };
                    messageText = "Received: Binary data";
                    console.log("Received binary data");
                }

                // Add message to list for debugging
                setMessages((prev) => [...prev, messageText]);
            } catch (err: unknown) {
                // Fixed catch callback variable type
                const errorStr = err instanceof Error ? err.message : "Unknown error";
                console.error("Error processing message:", errorStr);
                setMessages((prev) => [...prev, `Error processing message: ${errorStr}`]);
                setSubmitting(false); // Reset submitting state on error
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
            setIsConnected(false);
            setMessages((prev) => [...prev, "Disconnected from WebSocket"]);
            setSubmitting(false); // Reset submitting state when connection closes
        };

        ws.onerror = (wsError) => {
            console.error("WebSocket error:", wsError);
            setMessages((prev) => [...prev, "WebSocket error occurred"]);
            setSubmitting(false); // Reset submitting state on error
        };

        // Initial fetch
        void fetchActiveQuestion();

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [courseSessionId, fetchActiveQuestion, toast, submitting]);

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
            toast({ description: "Your answer has been submitted" });

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

            // Also send via API as a fallback - make this async
            void fetch("/api/submitStudentResponse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questionId: currentQuestion.id,
                    optionIds,
                }),
            }).catch((apiError) => {
                console.error("API error:", apiError);
            });

            // Fallback timer in case WebSocket response is never received
            setTimeout(() => {
                setSubmitting(false);
                console.log("Fallback timer: Setting submitting state to false"); // Add this log
            }, 3000);
        } catch (submitError: unknown) {
            // Fixed catch callback variable type
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
                            className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                        />
                        <span>{isConnected ? "Connected" : "Disconnected"}</span>
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
                        submitting ||
                        !selectedValues ||
                        (Array.isArray(selectedValues) && selectedValues.length === 0) ||
                        submitting ||
                        !isConnected
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
                    {submitting ? "Submitting..." : "Submit Answer"}
                </button>

                {/* Submission Status - crucial for visual feedback */}
                {submitting && <p className="mt-4 text-blue-500 text-[14px]">Submitting...</p>}

                {/* Footer Message */}
                <p className="mt-6 text-[14px] text-gray-500 text-center">
                    Instructor will start the next question shortly...
                </p>
            </div>
        </div>
    );
}
