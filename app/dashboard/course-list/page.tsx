"use client";

import { Course, Role, Schedule } from "@prisma/client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CourseCard from "@/components/ui/CourseCard";
import { AddCourseForm } from "@/components/AddCourseForm";
import { getUser } from "@/services/user";
import { getUserCourses } from "@/services/userCourse";
import { dayLabels, daysOptions } from "@/lib/constants";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

interface CourseWithSchedule extends Course {
    schedules: Schedule[];
}

export default function Page() {
    const session = useSession();
    const [courses, setCourses] = useState<CourseWithSchedule[]>();
    const [role, setRole] = useState<Role>("STUDENT");

    const user = session?.data?.user ?? { id: "", firstName: "" };

    useEffect(() => {
        const getCourses = async () => {
            try {
                const courseInfo = await getUserCourses(user.id);
                console.log(courseInfo);
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
                    <h1 className="text-5xl">Welcome Back, {user.firstName}!</h1>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
                                className="block md:hidden flex-col w-80 h-40 bg-[#F3F3F3] border border-black rounded-xl shadow-lg"
                            >
                                <div className="bg-[#D9D9D9] mt-4 h-4 w-full"></div>
                                <div className="min-h-[80%] py-3 px-6 flex flex-col gap-2 items-center justify-center">
                                    <p className="text-lg text-center">Add Class +</p>
                                </div>
                            </Link>
                            <Link
                                href="/join-course"
                                className="hidden md:block flex-col w-80 max-w-80 h-56 max-h-56 rounded-md shadow-lg"
                            >
                                <div className="bg-primary min-h-[40%] max-h-[40%] w-full rounded-t-md"></div>
                                <div className="h-[60%] max-h-[60%] bg-gray-50 w-full flex items-center justify-center">
                                    <p className="text-lg text-center font-medium text-primary">
                                        Add a Class +
                                    </p>
                                </div>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
