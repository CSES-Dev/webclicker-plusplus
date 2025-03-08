"use client";

import { useEffect, useState } from "react";
import SlidingCalendar from "../../components/ui/SlidingCalendar";
import { getCourseWithId } from "@/services/course";
import { AddQuestionForm } from "@/components/AddQuestionForm";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserCourses } from "@/services/userCourse";

export default function Page() {
    const searchParams = useSearchParams();
    const courseId = parseInt(searchParams.get("courseId") || "0");
    const [courseName, setCourseName] = useState<string>();
    const { data: session } = useSession();
    const router = useRouter();
    const [isLecturer, setIsLecturer] = useState(false);

    useEffect(() => {
        const checkUserRole = async () => {
            if (session?.user?.id) {
                const userCourses = await getUserCourses(session.user.id);
                const course = userCourses.find((c) => c.id === courseId);
                if (course?.role === "LECTURER") {
                    setIsLecturer(true);
                } else {
                    router.push("/dashboard");
                }
            }
        };
        checkUserRole();
    }, [session, courseId, router]);

    useEffect(() => {
        const getCourseName = async () => {
            try {
                const course = await getCourseWithId(courseId);
                setCourseName(course.title);
            } catch (error) {
                console.error("Failed to fetch course:", error);
            }
        };
        void getCourseName();
    }, [courseId]);

    if (!isLecturer) {
        return <div>Unauthorized access. Redirecting...</div>;
    }

    return (
        <div className="w-4/5 mx-auto flex flex-col justify-center items-center pt-10">
            <section className="w-full flex flex-col items-start pb-16">
                <h1 className="text-2xl font-normal">{courseName}</h1>
                <div className="flex flex-row gap-6 items-center mt-4 ml-auto">
                    <AddQuestionForm />
                    <button className="text-base sm:text-xl font-normal px-5 sm:px-10 py-3 bg-[#18328D] text-white rounded-xl">
                        Begin Poll
                    </button>
                </div>
            </section>
            <SlidingCalendar courseId={courseId} />
        </div>
    );
}