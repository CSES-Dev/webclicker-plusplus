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
            <div className="max-w-[90%]">
                <div className="hidden md:block justify-between pb-8">
                    <h1 className="text-[40px] leading-[48px] font-normal text-[#434343]">
                        Welcome Back, {user.firstName}!
                    </h1>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 py-8">
                    {courses?.map((course, idx) => {
                        return (
                            <CourseCard
                                key={idx}
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
                            />
                        );
                    })}

                    {/* Add Class Card */}

                    {role === "LECTURER" ? (
                        <AddCourseForm />
                    ) : (
                        <>
                            <Link
                                href="/join-course"
                                className="flex flex-col w-[476px] h-[345px] rounded-lg shadow-lg border border-gray-300"
                            >
                                <div className="bg-primary h-[40%] w-full rounded-t-lg"></div>
                                <div className="h-[60%] w-full bg-gray-50 flex items-center justify-center">
                                    <p className="text-lg font-medium text-primary">Add Class +</p>
                                </div>
                            </Link>
                            <Link
                                href="/join-course"
                                className="hidden md:flex flex-col w-[476px] h-[345px] rounded-lg shadow-lg border border-gray-300"
                            >
                                <div className="bg-primary h-[40%] w-full rounded-t-lg"></div>
                                <div className="h-[60%] w-full bg-gray-50 flex items-center justify-center">
                                    <p className="text-lg font-medium text-primary">Add a Class +</p>
                                </div>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
