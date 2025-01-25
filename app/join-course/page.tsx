"use client";

import React, { useState } from "react";

export default function page() {
    const [code, setCode] = useState<string>();
    const [course, setCourse] = useState<string>();

    const handleSubmit = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        console.log(code);
        setCourse("COGS 101B");
    };

    return (
        <>
            {!course && (
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col justify-center items-center gap-6 pt-56"
                >
                    <h1 className="text-3xl mb-5">Enter Classroom Code</h1>
                    <input
                        type="text"
                        onChange={(event) => setCode(event?.target.value)}
                        className="h-[3.5rem] w-80 px-5 mb-8 bg-[#F2F5FF] text-black rounded-[10px]"
                    ></input>
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
