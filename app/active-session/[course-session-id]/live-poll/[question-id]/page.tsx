// app/active-session/[course-session-id]/live-poll/[question-id]/page.tsx

"use client";
import { Option as PrismaOption, Question as PrismaQuestion } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AnswerOptions from "@/components/ui/answerOptions";
import BackButton from "@/components/ui/backButton";
import Header from "@/components/ui/header";
import QuestionCard from "@/components/ui/questionCard";

type QuestionWithOptions = PrismaQuestion & {
    options: PrismaOption[];
};

export default function LivePollQuestion() {
    // Extract the course-session-id and question-id from the URL
    const params = useParams();
    const router = useRouter();
    const courseSessionId = params["course-session-id"] as string;
    const questionId = params["question-id"] as string;

    const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Unified state for selected values (either single number or array of numbers)
    const [selectedValues, setSelectedValues] = useState<number | number[] | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `/api/fetchCourseSessionQuestions?sessionId=${courseSessionId ?? ""}`,
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch questions");
                }
                const data = (await response.json()) as QuestionWithOptions[];
                setQuestions(data);
                if (questionId) {
                    const index = data.findIndex((q) => q.id === Number(questionId));
                    if (index !== -1) {
                        setCurrentQuestionIndex(index);
                        // Set selected values based on question type
                        setSelectedValues(data[index].type === "MCQ" ? null : []);
                    } else if (data.length > 0) {
                        // If question ID not found, redirect to the first question
                        router.replace(
                            `/active-session/${courseSessionId}/live-poll/${String(data[0].id)}`,
                        );
                    }
                } else if (data.length > 0) {
                    // If no question ID, redirect to first question
                    router.replace(
                        `/active-session/${courseSessionId}/live-poll/${String(data[0].id)}`,
                    );
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (courseSessionId) {
            void fetchQuestions();
        }
    }, [courseSessionId, questionId, router]);

    // Handle loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-custom-background border-opacity-50 rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading questions...</p>
                </div>
            </div>
        );
    }

    if (error ?? questions.length === 0) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center p-6">
                    <p className="text-red-500 mb-4">
                        {error ?? "No questions found for this session"}
                    </p>
                    <BackButton href="/dashboard" />
                </div>
            </div>
        );
    }

    // Get the current question
    const currentQuestion = questions[currentQuestionIndex];
    const questionCount = `${String(currentQuestionIndex + 1)}/${String(questions.length)}`;
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

    // Handle answer selection (works for both MCQ and MSQ)
    const handleSelectionChange = (value: number | number[]) => {
        setSelectedValues(value);
    };

    const handleSubmit = async () => {
        if (!selectedValues || (Array.isArray(selectedValues) && selectedValues.length === 0)) {
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
                            <span className="text-lg">{questionCount}</span>
                            {currentQuestionIndex < questions.length - 1}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
                        <div
                            className="h-full bg-custom-background rounded-full"
                            style={{ width: `${String(progressPercent)}%` }}
                        ></div>
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
