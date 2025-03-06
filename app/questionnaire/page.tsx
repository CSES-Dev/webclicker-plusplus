"use client";

import { useEffect, useState } from "react";
import SlidingCalendar from "../../components/ui/SlidingCalendar";
import { getCourseWithId } from "@/services/course";

export default function Page() {
    const courseId = 19; //hard-coded for now
    const [courseName, setCourseName] = useState<string>();

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
    }, []);

    return (
        <div className="w-4/5 mx-auto flex flex-col justify-center items-center pt-10">
            <section className="w-full flex flex-col items-start pb-16">
                <h1 className="text-2xl font-normal">{courseName}</h1>
                <div className="flex flex-row gap-6 items-center mt-4 ml-auto">
                    <button className="text-base sm:text-xl font-normal px-5 sm:px-8 py-3 bg-[#F2F5FF] text-[#18328D] rounded-xl border border-[#A5A5A5]">
                        Add Question +
                    </button>
                    <button className="text-base sm:text-xl font-normal px-5 sm:px-10 py-3 bg-[#18328D] text-white rounded-xl">
                        Begin Poll
                    </button>
                </div>
            </section>
            <SlidingCalendar courseId={courseId} />
        </div>
    );
}
