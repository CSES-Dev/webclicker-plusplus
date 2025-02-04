"use client";

import React, { use, useEffect, useState } from "react";
import CourseCard from "../../components/ui/CourseCard";
import { getUserCourses } from "@/services/userCourse";

export default function page() {
    const [courses, setCourses] = useState<
        {
            color: string | undefined;
            title: string | undefined;
        }[]
    >();

    useEffect(() => {
        const getCourses = async () => {
            const courses = await getUserCourses(1);
            setCourses(courses);
        };
        getCourses();
    }, []);

    return (
        <div className="w-full flex justify-center items-center pt-6">
            <div className="max-w-[90%]">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {courses?.map((course, idx) => {
                        return (
                            <CourseCard
                                key={idx}
                                color={course.color ? course.color : ""}
                                days={["Monday"]}
                                course={course.title ? course.title : "Unknown"}
                                timeStart={"10:00"}
                                timeEnd={"12:00"}
                            />
                        );
                    })}

                    {/* Add Class Card */}

                    {/* mobile view */}
                    <button className="block md:hidden flex-col w-80 h-40 bg-[#F3F3F3] border border-black rounded-xl shadow-lg">
                        <div className="bg-[#D9D9D9] mt-4 h-4 w-full"></div>
                        <div className="min-h-[80%] py-3 px-6 flex flex-col gap-2 items-center justify-center">
                            <p className="text-lg text-center">Add Class +</p>
                        </div>
                    </button>

                    {/* desktop view */}
                    <button className="hidden md:block flex-col w-80 max-w-80 h-56 max-h-56 rounded-md shadow-lg">
                        <div className="bg-gray-300 min-h-[40%] max-h-[40%] w-full rounded-t-md"></div>
                        <div className="h-[60%] max-h-[60%] bg-gray-50 w-full flex items-center justify-center">
                            <p className="text-lg text-center font-medium text-[#18328D]">
                                Add a Class +
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
