"use client";
import { CourseSession } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BackButton from "@/components/ui/backButton";
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";
import Header from "@/components/ui/header";
import { findActiveCourseSession } from "@/services/courseSession";

export default function CourseDetails() {
    const router = useRouter();
    const params = useParams();
    const courseId = parseInt(params["course-id"] as string);
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<CourseSession | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getActiveSession = async () => {
            try {
                if (isNaN(courseId)) {
                    setError("Invalid course ID");
                    setIsLoading(false);
                    return;
                }

                const activeSession = await findActiveCourseSession(courseId);
                setSession(activeSession);
                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching course session:", err);
                setError("Failed to load course session");
                setIsLoading(false);
            }
        };

        void getActiveSession();
    }, [courseId]);

    if (isLoading) {
        return <GlobalLoadingSpinner />;
    }

    if (error) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!session) {
        return (
            <>
                <Header />
                <div className="flex flex-col min-h-screen">
                    <div className="p-4">
                        <BackButton href="/dashboard" />
                    </div>
                    <div className="flex flex-col items-center lg:mt-8 flex-grow sm:mt-10">
                        <div className="text-center mx-auto px-4 py-10">
                            <h1 className="text-5xl font-normal mb-6 top-1">No Poll Yet</h1>
                            <p className="text-2xl mb-10">
                                Please wait for your instructor to start the poll
                            </p>

                            <button
                                onClick={() => {
                                    window.location.reload();
                                }}
                                className="w-full px-[47px] py-3 bg-custom-background text-white rounded-md text-lg font-medium"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (session) {
        router.push(`${String(courseId)}/active-session/${String(session.id)}/live-poll`);
    }
}
