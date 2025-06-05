"use client";

import { AddEditQuestionForm } from "@/components/AddEditQuestionForm";
import { AddInstructorForm } from "@/components/AddInstuctorForm";
import BeginPollDialog from "@/components/BeginPollDialog";
import SlidingCalendar from "@/components/ui/SlidingCalendar";
import { Button } from "@/components/ui/button";
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { formatDateToISO } from "@/lib/utils";
import { getCourseSessionByDate } from "@/services/session";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params.courseId as string) ?? "0");
    const [hasActiveSession, setHasActiveSession] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [refreshCalendar, setRefreshCalendar] = useState(false);
    const handleQuestionUpdate = () => {
        setRefreshCalendar((prev) => !prev);
    };

    useEffect(() => {
        const getCourseInfo = async () => {
            setHasActiveSession(false);
            setIsLoading(true);
            try {
                const courseSession = await getCourseSessionByDate(
                    courseId,
                    formatDateToISO(new Date()),
                );
                if (courseSession?.activeQuestionId) {
                    setHasActiveSession(true);
                }
            } catch (error) {
                toast({ variant: "destructive", description: "Could not get course information." });
                console.error("Failed to fetch course:", error);
                router.push("/dashboard");
            } finally {
                setIsLoading(false);
            }
        };
        void getCourseInfo();
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
            <SlidingCalendar
                courseId={courseId}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                refreshTrigger={refreshCalendar}
            />
            <AddInstructorForm />
        </div>
    );
}
