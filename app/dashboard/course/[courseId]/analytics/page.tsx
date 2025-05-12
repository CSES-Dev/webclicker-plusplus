"use client";

import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import { ChartConfig } from "@/components/ui/chart";
import DonutChart from "@/components/ui/DonutChart";

const chartData = [
    { idea: "participated", count: 200, fill: "#CCCCCC" },
    { idea: "notParticipated", count: 300, fill: "#BAFF7E" },
];
const chartConfig = {
    count: {
        label: "Count",
    },
    participated: {
        label: "Participated",
        color: "grey",
    },
    notParticipated: {
        label: "Not Participated",
        color: "black",
    },
} satisfies ChartConfig;

const dataKey = "count";
const nameKey = "idea";
const description = "Class Average";
const descriptionStatistic = 75;

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params.courseId as string) ?? "0");
    const [query, setQuery] = useState<string>();

    return (
        <div className="w-full flex flex-col">
            <h1 className="text-2xl font-normal pl-1">Overall Performance</h1>
            <div className="bg-white h-80 max-h-80 w-full rounded-[20px] border border-[#A5A5A5] mt-4">
                <div className="">
                    <div className="pl-7 pt-6">
                        <DonutChart
                            chartData={chartData}
                            chartConfig={chartConfig}
                            dataKey={dataKey}
                            nameKey={nameKey}
                            description={description}
                            descriptionStatistic={descriptionStatistic}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-between mt-8 pl-1">
                <h1 className="text-2xl font-normal">Student Data</h1>
                <input
                    type="text"
                    placeholder="Search student..."
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-10 w-[14vw] px-3 bg-white text-black border border-slate-300 rounded-lg focus:outline-none"
                />
            </div>
            <div className="bg-white h-72 w-full rounded-[20px] border border-[#A5A5A5] mt-4 px-3 pt-2 overflow-y-auto">
                <Table className="relative rounded-[20px] w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead key={"name"} className="w-1/5">
                                Name
                            </TableHead>
                            <TableHead key={"id"} className="w-1/5">
                                Identification
                            </TableHead>
                            <TableHead key={"attendance"} className="w-1/5">
                                Attendance
                            </TableHead>
                            <TableHead key={"score"} className="w-1/5">
                                Poll Score
                            </TableHead>
                            <TableHead key={"activity"} className="w-1/5">
                                Activity
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 })
                            .keys()
                            .map((i) => (
                                <TableRow key={i}>
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
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
