import React, { useEffect } from "react";
import CourseCard from "../../components/ui/CourseCard";
import { Props } from "../../components/ui/CourseCard";
export default function page() {
    const placeholder: Props[] = [
        {
            color: "course_pink",
            days: ["Monday", "Wednesday"],
            course: "COGS 107A: Neuroanatomy and Physiology",
            timeStart: "10:00 am",
            timeEnd: "10:50 am",
        },
        {
            color: "course_yellow",
            days: ["Monday", "Thursday"],
            course: "COGS 107B: Neuroanatomy",
            timeStart: "10:30 am",
            timeEnd: "11:50 am",
        },
        {
            color: "course_green",
            days: ["Monday", "Thursday"],
            course: "COGS 107B: Neuroanatomy",
            timeStart: "10:30 am",
            timeEnd: "11:50 am",
        },
    ];
    //get courses
    useEffect(() => {});
    return (
        <div className="w-full flex justify-center items-center pt-6">
            <div className="max-w-[90%]">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {placeholder.map((course, idx) => {
                        return (
                            <CourseCard
                                key={idx}
                                color={course.color}
                                days={course.days}
                                course={course.course}
                                timeStart={course.timeStart}
                                timeEnd={course.timeEnd}
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
