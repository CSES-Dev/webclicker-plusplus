"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddEditQuestionForm } from "@/components/AddEditQuestionForm";
import { AddInstructorForm } from "@/components/AddInstuctorForm";
import BeginPollDialog from "@/components/BeginPollDialog";
import SlidingCalendar from "@/components/ui/SlidingCalendar";
import { Button } from "@/components/ui/button";
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { formatDateToISO } from "@/lib/utils";
import { getCourseWithId } from "@/services/course";
import { getCourseSessionByDate } from "@/services/session";

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params.courseId as string) ?? "0");
    const [courseInfo, setCourseInfo] = useState<{ name: string; code: string }>();
    const [hasActiveSession, setHasActiveSession] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const [refreshCalendar, setRefreshCalendar] = useState(false);
    const handleQuestionUpdate = () => {
        setRefreshCalendar((prev) => !prev);
    };

    useEffect(() => {
        const getCourseName = async () => {
            setHasActiveSession(false);
            setIsLoading(true);
            try {
                const course = await getCourseWithId(courseId);
                const courseSession = await getCourseSessionByDate(
                    courseId,
                    formatDateToISO(new Date()),
                );
                if (courseSession?.activeQuestionId) {
                    setHasActiveSession(true);
                }
                setCourseInfo({ name: course.title, code: course.code });
            } catch (error) {
                toast({ variant: "destructive", description: "Could not get course information." });
                console.error("Failed to fetch course:", error);
                router.push("/dashboard");
            } finally {
                setIsLoading(false);
            }
        };
        void getCourseName();
    }, [courseId]);

    if (isLoading) {
        return <GlobalLoadingSpinner />;
    }

    return (
        <div className="w-full mx-auto flex flex-col gap-8 justify-center items-center">
            <section className="w-full flex flex-col items-start">
                <div className="flex flex-row gap-6 items-center mt-4 ml-auto">
                    <AddEditQuestionForm
                        defaultDate={new Date(formatDateToISO(new Date()))}
                        courseId={courseId}
                        location="page"
                        onUpdate={handleQuestionUpdate}
                    />

                    {hasActiveSession ? (
                        <Button
                            asChild
                            className="h-[50px] w-48 text-base sm:text-xl font-normal rounded-xl"
                        >
                            <Link href={`/dashboard/course/${courseId}/start-session`}>
                                Continue Poll
                            </Link>
                        </Button>
                    ) : (
                        <BeginPollDialog />
                    )}
                </div>
            </section>
            <SlidingCalendar courseId={courseId} refreshTrigger={refreshCalendar} />
            <AddInstructorForm />
        </div>
    );
}
