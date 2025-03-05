// app/active-session/[course-session-id]/live-poll/page.tsx

"use client";

import { Question as PrismaQuestion } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
type QuestionResponse = PrismaQuestion[];

export default function LivePollRedirect() {
    const params = useParams();
    const router = useRouter();
    const courseSessionId = params["course-session-id"] as string;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFirstQuestionAndRedirect = async () => {
            try {
                // Fetch questions to get the first question ID
                const response = await fetch(
                    `/api/fetchCourseSessionQuestions?sessionId=${courseSessionId ?? ""}`,
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch questions");
                }

                const data = (await response.json()) as QuestionResponse;

                if (data.length > 0) {
                    // Redirect to the first question
                    router.replace(
                        `/active-session/${courseSessionId}/live-poll/${String(data[0].id)}`,
                    );
                } else {
                    setError("No questions found for this session");
                    setLoading(false);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred");
                setLoading(false);
            }
        };

        if (courseSessionId) {
            void fetchFirstQuestionAndRedirect();
        }
    }, [courseSessionId, router]);

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

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center p-6">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            router.push("/dashboard");
                        }}
                        className="px-4 py-2 bg-custom-background text-white rounded-md hover:bg-opacity-90 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return null;
}
