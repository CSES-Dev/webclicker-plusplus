// app/active-session/[course-session-id]/live-poll/page.tsx

"use client";
import { Option as PrismaOption, Question as PrismaQuestion } from "@prisma/client";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AnswerOptions from "@/components/ui/answerOptions";
import BackButton from "@/components/ui/backButton";
import Header from "@/components/ui/header";
import QuestionCard from "@/components/ui/questionCard";

type QuestionWithOptions = PrismaQuestion & {
    options: PrismaOption[];
};

type fetchCourseSessionQuestionResponse = {
    activeQuestionId: number;
    totalQuestions: number;
};

export default function LivePoll() {
    // Extract the course-session-id from the URL
    const params = useParams();
    // const router = useRouter();
    const courseSessionId = params["course-session-id"] as string;

    const [currentQuestion, setCurrentQuestion] = useState<QuestionWithOptions | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [questionCount, setQuestionCount] = useState("1");

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
                throw new Error("Failed to fetch course session");
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
                throw new Error("Failed to fetch question");
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
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [courseSessionId]); // Only depends on courseSessionId

    // Initial fetch and polling setup
    useEffect(() => {
        if (!courseSessionId) return;

        let intervalId: NodeJS.Timeout | null = null;

        // Create an async function to handle the initial fetch
        const initialFetch = async () => {
            try {
                // Wait for the initial fetch to complete
                await fetchActiveQuestion();

                // Once initial fetch is done, start polling
                intervalId = setInterval(() => {
                    void fetchActiveQuestion();
                }, 5000); // Poll every 5 seconds
            } catch (errorMessage) {
                console.error("Error in initial fetch:", errorMessage);
            }
        };
        void initialFetch();
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fetchActiveQuestion]); // Dependency on memoized fetchActiveQuestion

    // Handle loading state
    if (loading && !currentQuestion) {
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
                    <BackButton href="/dashboard" />
                </div>
            </div>
        );
    }

    // Handle answer selection (works for both MCQ and MSQ)
    const handleSelectionChange = (value: number | number[]) => {
        setSelectedValues(value);
    };

    const handleSubmit = async () => {
        if (
            !selectedValues ||
            (Array.isArray(selectedValues) && selectedValues.length === 0) ||
            !currentQuestion
        ) {
            return;
        }
        const optionIds = Array.isArray(selectedValues) ? selectedValues : [selectedValues];

        try {
            setSubmitting(true);
            const response = await fetch("/api/submitStudentResponse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questionId: currentQuestion.id,
                    optionIds,
                }),
            });

            if (!response.ok) {
                console.error("Failed to save answer");
            }
        } catch (submitError) {
            console.error("Error saving answer:", submitError);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header */}
            <Header />

            <div className="p-4 sm:p-6 flex flex-col items-center">
                {/* Back Button */}
                <div className="self-start mb-6 mt-2">
                    <BackButton href="/dashboard" />
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

                {/* Loading indicator for refreshing questions */}
                {/* {loading && currentQuestion && (
                    <div className="absolute top-4 right-4 flex items-center">
                        <div className="w-4 h-4 border-2 border-t-custom-background border-opacity-50 rounded-full animate-spin mr-2"></div>
                        <span className="text-xs text-gray-500">Syncing...</span>
                    </div>
                )} */}

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
                    onClick={() => {
                        void handleSubmit();
                    }}
                    disabled={
                        !selectedValues ||
                        (Array.isArray(selectedValues) && selectedValues.length === 0) ||
                        submitting
                    }
                    className="mt-6 px-6 py-2 bg-custom-background text-white rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {submitting ? "Submitting..." : "Submit Answer"}
                </button>

                {/* Submission Status */}
                {submitting && (
                    <p className="mt-4 text-blue-500 text-[14px]">Saving your answer...</p>
                )}

                {/* Footer Message */}
                <p className="mt-6 text-[14px] text-gray-500 text-center">
                    Instructor will start the next question shortly...
                </p>
            </div>
        </div>
    );
}
