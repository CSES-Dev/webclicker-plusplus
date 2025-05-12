"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
                    placeholder="Search student..."
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-[14vw] px-3 bg-white text-black border border-slate-300 rounded-lg focus:outline-none"
                />
            </div>
            <div className="bg-white h-52 w-full rounded-[20px] border border-[#A5A5A5] mt-4 px-3">
                <Table className="rounded-[20px] w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/5">Name</TableHead>
                            <TableHead className="w-1/5">Identification</TableHead>
                            <TableHead className="w-1/5">Attendance</TableHead>
                            <TableHead className="w-1/5">Poll Score</TableHead>
                            <TableHead className="w-1/5">Activity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium max-w-[200px] truncate">
                                Student name here
                            </TableCell>
                            <TableCell className="max-w-1/5 truncate">A123456789</TableCell>
                            <TableCell className="max-w-1/5 truncate">85%</TableCell>
                            <TableCell className="max-w-1/5 truncate">85%</TableCell>
                            <TableCell>
                                <button className="w-32 h-8 bg-white border border-[#A5A5A5] hover:bg-slate-100 rounded-md">
                                    View Activity →
                                </button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
