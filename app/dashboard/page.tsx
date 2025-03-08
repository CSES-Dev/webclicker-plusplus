"use client";

import { Course, Role, Schedule } from "@prisma/client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AddCourseForm } from "@/components/AddCourseForm";
import CourseCard from "@/components/ui/CourseCard";
import { dayLabels, daysOptions } from "@/lib/constants";
import { getUserCourses } from "@/services/userCourse";

interface CourseWithSchedule extends Course {
    schedules: Schedule[];
}

export default function Page() {
    const session = useSession();
    const [courses, setCourses] = useState<(CourseWithSchedule & { role: Role })[]>();
    const [role, setRole] = useState<Role>("STUDENT");

    const user = session?.data?.user ?? { id: "", firstName: "" };

    useEffect(() => {
        const getCourses = async () => {
            try {
                const courseInfo = await getUserCourses(user.id);
                setCourses(courseInfo);
            } catch (err) {
                console.log("Error fetching courses", err);
            }
        };
        if (window !== undefined) {
            setRole((localStorage?.getItem("userRole") ?? "STUDENT") as Role);
        }
        void getCourses();
    }, []);

    return (
        <div className="w-full flex flex-col justify-center items-center pt-10">
            <div className="w-full px-4 md:px-8 max-w-[1800px] mx-auto">
                <div className="hidden md:block justify-between pb-8">
                    <h1 className="text-[40px] leading-[48px] font-normal text-[#333]">
                        Welcome Back, {user.firstName}!
                    </h1>
                </div>

                {/* Grid layout with responsive column count */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 py-8">
                    {courses?.map((course, idx) => (
                        <div key={idx} className="flex justify-center">
                            <CourseCard
                                color={course.color ?? ""}
                                days={
                                    course.schedules?.[0]?.dayOfWeek.map(
                                        (item) => dayLabels[item as (typeof daysOptions)[number]],
                                    ) ?? []
                                }
                                title={course.title ?? "Unknown"}
                                timeStart={course.schedules?.[0]?.startTime ?? ""}
                                timeEnd={course.schedules?.[0]?.endTime ?? ""}
                                code={course.code ?? ""}
                                role={course.role ?? "STUDENT"}
                                id={course.id}
                            />
                        </div>
                    ))}

                    {/* Add Class Card */}
                    <div className="flex justify-center">
                        {role === "LECTURER" ? (
                            <AddCourseForm />
                        ) : (
                            <Link
                                href="/join-course"
                                className="flex flex-col w-80 h-56 rounded-md shadow-lg border border-gray-300"
                            >
                                <div className="bg-primary h-[40%] w-full rounded-t-md"></div>
                                <div className="h-[60%] w-full bg-gray-50 flex items-center justify-center rounded-b-md">
                                    <p className="text-lg font-medium text-primary">Add Class +</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
