"use client";

import { useParams } from "next/navigation";
import React, { useState } from "react";

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params.courseId as string) ?? "0");
    const [query, setQuery] = useState<string>();

    return (
        <div className="w-full flex flex-col">
            <h1 className="text-2xl font-normal pl-1">Overall Performance</h1>
            <div className="bg-white h-52 w-full rounded-[20px] border border-[#A5A5A5] mt-4"></div>
            <div className="flex flex-row justify-between mt-8 pl-1">
                <h1 className="text-2xl font-normal">Student Data</h1>
                <input
                    type="text"
                    placeholder="Search student"
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-[14vw] px-3 bg-white text-black border border-slate-300 rounded-lg focus:outline-none"
                />
            </div>
            <div className="bg-white h-52 w-full rounded-[20px] border border-[#A5A5A5] mt-4"></div>
        </div>
    );
}
