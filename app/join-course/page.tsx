"use client";

import React, { useState } from "react";
import { getCourseWithCode } from "@/services/course";
import { addUserToCourse } from "@/services/userCourse";

export default function page() {
    const [code, setCode] = useState<string>();
    const [course, setCourse] = useState<string>();
    const [error, setError] = useState<string>();

    const handleSubmit = async (event: { preventDefault: () => void }) => {
        event.preventDefault();
        if (code) {
            const course = await getCourseWithCode(code);
            if (course) {
                // find user id with user email
                const res = await addUserToCourse(course.id, 1);
                if (res?.error) setError(res.error);
                else setCourse(course.title);
            } else setError("Invalid code");
        } else setError("Invalid code");
    };

    return (
        <>
            {!course && (
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col justify-center items-center gap-6 pt-56"
                >
                    <h1 className="text-3xl mb-5">Enter Classroom Code</h1>
                    <div className="mb-8">
                        <input
                            type="text"
                            onChange={(event) => setCode(event?.target.value)}
                            className="h-[3.5rem] w-80 px-5 bg-[#F2F5FF] text-black rounded-[10px]"
                        ></input>
                        {error && (
                            <p className="text-red-700 mt-2 absolute left-1/2 -translate-x-1/2">
                                {error}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={code ? false : true}
                        className="py-3 px-12 bg-[#18328D] disabled:bg-[#CFDAFF] text-white rounded-lg"
                    >
                        Enter
                    </button>
                </form>
            )}
            {course && (
                <div className="flex flex-col justify-center items-center gap-9 pt-56">
                    <h1 className="text-3xl text-center">
                        You have been <br /> successfully added to
                    </h1>
                    <h1 className="text-3xl pb-16">{course}</h1>
                    <button className="py-2 w-72 pb-2 bg-[#18328D] text-white rounded-lg">
                        Continue
                    </button>
                    <button className="py-2 w-72 bg-white text-[#18328D] border border-[#18328D] rounded-lg">
                        Send email confirmation
                    </button>
                </div>
            )}
        </>
    );
}
