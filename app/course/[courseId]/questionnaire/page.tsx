"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddInstructorForm } from "@/components/AddInstuctorForm";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import SlidingCalendar from "@/components/ui/SlidingCalendar";
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";
import useAccess from "@/hooks/use-access";
import { useToast } from "@/hooks/use-toast";
import { getCourseWithId } from "@/services/course";
import BeginPollDialog from "@/components/BeginPollDialog";
import { getCourseSessionByDate } from "@/services/session";
import { formatDateToISO } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params["courseId"] as string) ?? "0");
    const [courseInfo, setCourseInfo] = useState<{ name: string; code: string }>();
    const [activeSession, setActiveSession] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const { hasAccess, isLoading: isAccessLoading } = useAccess({ courseId, role: "LECTURER" });

    useEffect(() => {
        if (isAccessLoading) {
            return;
        }
        if (!isAccessLoading && !hasAccess) {
            toast({ variant: "destructive", description: "Access denied!" });
            router.push("/dashboard");
            return;
        }
        const getCourseName = async () => {
            setActiveSession(null);
            setIsLoading(true);
            try {
                const course = await getCourseWithId(courseId);
                const courseSession = await getCourseSessionByDate(
                    courseId,
                    formatDateToISO(new Date()),
                );
                setActiveSession(courseSession?.id ?? null);
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
    }, [courseId, hasAccess, isAccessLoading]);

    if (isAccessLoading || !hasAccess || isLoading) {
        return <GlobalLoadingSpinner />;
    }

    return (
        <div className="w-4/5 mx-auto flex flex-col gap-8 justify-center items-center py-10">
            <section className="w-full flex flex-col items-start">
                <h1 className="text-2xl font-normal">
                    {`${courseInfo?.name} (${courseInfo?.code})`}{" "}
                </h1>
                <div className="flex flex-row gap-6 items-center mt-4 ml-auto">
                    <AddQuestionForm courseId={courseId} location="page" />
                    {activeSession ? (
                        <Button
                            asChild
                            className="h-[50px] w-48 text-base sm:text-xl font-normal rounded-xl"
                        >
                            <Link href={`/course/${courseId}/start-session`}>Continue Poll</Link>
                        </Button>
                    ) : (
                        <BeginPollDialog />
                    )}
                </div>
            </section>
            <SlidingCalendar courseId={courseId} />
            <AddInstructorForm />
        </div>
    );
}
