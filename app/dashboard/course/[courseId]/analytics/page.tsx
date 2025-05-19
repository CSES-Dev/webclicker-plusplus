"use client";

import React, { useEffect, useState } from "react";
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
import { getPastQuestionsWithScore, getResponseStatistics } from "@/services/question";
import { useToast } from "@/hooks/use-toast";
import { chartConfig, dataKey, description, nameKey } from "@/lib/constants";

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params.courseId as string) ?? "0");
    const [pastQuestions, setPastQuestions] = useState<
        { type: string; title: string; average: number }[]
    >([]);
    const [responseStatistics, setResponseStatistics] = useState<{
        incorrect: number;
        correct: number;
    }>({
        incorrect: 0,
        correct: 0,
    });
    const [students, setStudents] = useState();
    const { toast } = useToast();

    const chartData = [
        { result: "correct", count: responseStatistics.correct, fill: "#BAFF7E" },
        { result: "incorrect", count: responseStatistics.incorrect, fill: "#CCCCCC" },
    ];

    useEffect(() => {
        const fetchCourseStatistics = async () => {
            await getPastQuestionsWithScore(courseId)
                .then((res) => {
                    if ("error" in res)
                        return toast({
                            variant: "destructive",
                            description: res?.error ?? "Unknown error occurred.",
                        });
                    else {
                        setPastQuestions(res);
                    }
                })
                .catch((err: unknown) => {
                    console.error(err);
                    return toast({
                        variant: "destructive",
                        description: "Unknown error occurred.",
                    });
                });
            await getResponseStatistics(courseId)
                .then((res) => {
                    if (typeof res !== "number" && "error" in res)
                        return toast({
                            variant: "destructive",
                            description: res?.error ?? "Unknown error occurred.",
                        });
                    else {
                        setResponseStatistics(res);
                    }
                })
                .catch((err: unknown) => {
                    console.error(err);
                    return toast({
                        variant: "destructive",
                        description: "Unknown error occurred.",
                    });
                });
        };
        const fetchStudentData = async () => {};
        fetchCourseStatistics();
        fetchStudentData();
    }, []);

    return (
        <div className="w-full flex flex-col">
            <h1 className="text-2xl font-normal pl-1">Overall Performance</h1>
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-stretch bg-white h-80 max-h-80 w-full px-7 rounded-[20px] border border-[#A5A5A5] mt-4">
                {/* Donut Chart */}
                <div className="h-full w-full md:w-1/2 py-auto">
                    <DonutChart
                        chartData={chartData}
                        chartConfig={chartConfig}
                        dataKey={dataKey}
                        nameKey={nameKey}
                        description={description}
                        descriptionStatistic={
                            responseStatistics.correct + responseStatistics.incorrect !== 0
                                ? Math.trunc(
                                      (responseStatistics.correct /
                                          (responseStatistics.correct +
                                              responseStatistics.incorrect)) *
                                          100,
                                  )
                                : 0
                        }
                    />
                </div>
                {/* Past Questions */}
                <div className="hidden md:flex flex-col justify-center items-center w-full md:w-1/2 h-full gap-3">
                    {pastQuestions.map((question, idx) => (
                        <div
                            key={idx}
                            className="h-28 w-full p-4 bg-slate-50/10 shadow-md rounded-lg border border-slate-400"
                        >
                            <div className="flex flex-row justify-between">
                                <p className="text-red-900 bg-[#D9C7C7] rounded-sm p-1 px-2 text-sm">
                                    {question.type}
                                </p>
                                <p className="text-lg font-semibold">{question.average}</p>
                            </div>
                            <p className="text-base pt-2">{question.title}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex flex-row justify-between mt-8 pl-1">
                <h1 className="text-2xl font-normal">Student Data</h1>
                <button className="h-10 w-40 px-3 bg-[hsl(var(--primary))] text-white rounded-lg focus:outline-none">
                    Export CSV
                </button>
            </div>
            {/* Student Data Table */}
            <div className="bg-white h-72 w-full rounded-[20px] border border-[#A5A5A5] mt-4 px-3 pt-2 overflow-y-auto">
                <Table className="relative rounded-[20px] w-full">
                    <TableHeader className="h-14">
                        <TableRow>
                            <TableHead key={"name"} className="w-1/5">
                                Student
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
                                <input
                                    type="text"
                                    placeholder="Search student..."
                                    className="h-8 w-[12vw] px-3 bg-white text-black border border-slate-300 rounded-lg focus:outline-none"
                                />
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 10 })
                            .keys()
                            .map((i) => (
                                <TableRow key={i}>
                                    <TableCell className="max-w-[200px] truncate">
                                        <p className="text-base">Student name here</p>
                                        <p className="text-medium">student@ucsd.edu</p>
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
