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

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params["courseId"] as string) ?? "0");
    const [courseInfo, setCourseInfo] = useState<{ name: string; code: string }>();
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
            try {
                const course = await getCourseWithId(courseId);
                setCourseInfo({ name: course.title, code: course.code });
            } catch (error) {
                toast({ variant: "destructive", description: "Could not get course information." });
                console.error("Failed to fetch course:", error);
                router.push("/dashboard");
            }
        };
        void getCourseName();
    }, [courseId, hasAccess, isAccessLoading]);

    if (isAccessLoading || !hasAccess) {
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
                    <button className="text-base sm:text-xl font-normal px-5 sm:px-10 py-3 bg-[#18328D] text-white rounded-xl">
                        Begin Poll
                    </button>
                </div>
            </section>
            <SlidingCalendar courseId={courseId} />
            <AddInstructorForm />
        </div>
    );
}
