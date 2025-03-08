"use client";
import { CourseSession } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LivePoll from "@/components/LivePoll";
import BackButton from "@/components/ui/backButton";
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";
import Header from "@/components/ui/header";
import useAccess from "@/hooks/use-access";
import { useToast } from "@/hooks/use-toast";
import { findActiveCourseSession } from "@/services/findCourseSession";

export default function CourseDetails() {
    const router = useRouter();
    const params = useParams();
    const courseId = parseInt(params["course-id"] as string);
    const { hasAccess, isLoading: isAccessLoading } = useAccess({ courseId, role: "STUDENT" });

    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [courseSession, setCourseSession] = useState<CourseSession | null>(null);

    const getActiveSession = async () => {
        setCourseSession(null);
        setIsLoading(true);
        if (isNaN(courseId)) {
            toast({ variant: "destructive", description: "Invalid course ID" });
            setIsLoading(false);
            return;
        }

        await findActiveCourseSession(courseId)
            .then((res) => {
                if (res?.id) {
                    setCourseSession(res);
                }
            })
            .catch((err: unknown) => {
                console.error("Error fetching course session:", err);
                toast({ variant: "destructive", description: "Failed to load course session" });
                setIsLoading(false);
            });

        setIsLoading(false);
    };

    useEffect(() => {
        if (isAccessLoading) {
            return;
        }
        if (!hasAccess) {
            toast({ variant: "destructive", description: "Access denied!" });
            router.push("/dashboard");
            return;
        }
        void getActiveSession();
    }, [courseId, hasAccess, isAccessLoading]);

    if (isLoading || isAccessLoading) {
        return <GlobalLoadingSpinner />;
    }

    return !courseSession ? (
        <div className="flex flex-col h-full">
            <Header />
            <div className="flex-1 flex flex-col">
                <div className="p-4">
                    <BackButton href="/dashboard" />
                </div>
                <div className="flex flex-col justify-center items-center flex-grow">
                    <div className="text-center mx-auto px-4 py-10">
                        <h1 className="text-3xl lg:text-4xl font-semibold mb-6 top-1">
                            No Poll Yet
                        </h1>
                        <p className="text-lg lg:text-xl mb-10">
                            Please wait for your instructor to start the poll
                        </p>

                        <button
                            onClick={() => {
                                void getActiveSession();
                            }}
                            className="w-full px-[47px] py-3 bg-custom-background text-white rounded-md text-lg font-medium"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <LivePoll courseSessionId={courseSession?.id} />
    );
}
