"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import CourseCard from "../../components/ui/CourseCard";
import { getUser } from "@/services/user";
import { getUserCourses } from "@/services/userCourse";

export default function Page() {
    const [courses, setCourses] = useState<
        {
            color: string | undefined;
            title: string | undefined;
            days: string[] | undefined;
            startTime: string | undefined;
            endTime: string | undefined;
        }[]
    >();
    const [name, setName] = useState<string>();

    useEffect(() => {
        const getUsername = async () => {
            try {
                const id = 1;
                const user = await getUser({ id });
                setName(user?.firstName);
            } catch (err) {
                console.log("Error fetching user", err);
            }
        };
        const getCourses = async () => {
            try {
                const courseInfo = await getUserCourses(1);
                setCourses(courseInfo);
            } catch (err) {
                console.log("Error fetching courses", err);
            }
        };
        void getUsername();
        void getCourses();
    }, []);

    return (
        <div className="w-full flex flex-col justify-center items-center pt-10">
            <div className="max-w-[90%]">
                <div className="hidden md:block justify-between pb-8">
                    <h1 className="text-3xl">Welcome Back, {name}!</h1>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {courses?.map((course, idx) => {
                        return (
                            <CourseCard
                                key={idx}
                                color={course.color ?? ""}
                                days={course.days ?? []}
                                title={course.title ?? "Unknown"}
                                timeStart={course.startTime ?? ""}
                                timeEnd={course.endTime ?? ""}
                            />
                        );
                    })}

                    {/* Add Class Card */}

                    {/* mobile view */}
                    <Link
                        href="/join-course"
                        className="block md:hidden flex-col w-80 h-40 bg-[#F3F3F3] border border-black rounded-xl shadow-lg"
                    >
                        <div className="bg-[#D9D9D9] mt-4 h-4 w-full"></div>
                        <div className="min-h-[80%] py-3 px-6 flex flex-col gap-2 items-center justify-center">
                            <p className="text-lg text-center">Add Class +</p>
                        </div>
                    </Link>

                    {/* desktop view */}
                    <Link
                        href="/join-course"
                        className="hidden md:block flex-col w-80 max-w-80 h-56 max-h-56 rounded-md shadow-lg"
                    >
                        <div className="bg-gray-300 min-h-[40%] max-h-[40%] w-full rounded-t-md"></div>
                        <div className="h-[60%] max-h-[60%] bg-gray-50 w-full flex items-center justify-center">
                            <p className="text-lg text-center font-medium text-[#18328D]">
                                Add a Class +
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
