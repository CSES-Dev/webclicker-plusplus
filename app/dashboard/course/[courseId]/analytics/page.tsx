"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import DonutChart from "@/components/ui/DonutChart";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
    chartConfig,
    dataKey,
    description,
    nameKey,
    questionTypeMap,
    analyticsPages,
} from "@/lib/constants";
import { getPastQuestionsWithScore, getResponseStatistics } from "@/services/question";
import { getStudents } from "@/services/userCourse";

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params.courseId as string) ?? "0");
    const [pastQuestions, setPastQuestions] = useState<
        { type: keyof typeof questionTypeMap; title: string; average: number }[]
    >([]);
    const [responseStatistics, setResponseStatistics] = useState<{
        incorrect: number;
        correct: number;
    }>({
        incorrect: 0,
        correct: 0,
    });
    const [students, setStudents] = useState<
        {
            name: string;
            email: string | null;
            attendance: number;
            pollScore: number;
        }[]
    >([]);
    const [page, setPage] = useState<string>("Performance");
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
        const fetchStudentData = async () => {
            await getStudents(courseId)
                .then((res) => {
                    if ("error" in res)
                        return toast({
                            variant: "destructive",
                            description: res?.error ?? "Unknown error occurred.",
                        });
                    else {
                        setStudents(res);
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
        void fetchCourseStatistics();
        void fetchStudentData();
    }, []);

    return (
        <div className="w-full flex flex-col">
            <div className="flex flex-row gap-2 bg-slate-200 h-fit w-fit p-1 rounded-md mb-4">
                {analyticsPages.map((pageTitle: string) => (
                    <button
                        key={pageTitle}
                        className={`p-2 h-fit px-4 rounded-md transition-colors duration-300 ease-in-out ${
                            page === pageTitle
                                ? "bg-white text-[hsl(var(--primary))]"
                                : "bg-slate-200 text-slate-500"
                        }`}
                        onClick={() => setPage(pageTitle)}
                    >
                        {pageTitle}
                    </button>
                ))}
                {/* <button className="bg-white p-2 h-fit px-4 rounded-md">Performance</button>
                <button className="bg-white p-2 h-fit px-4 rounded-md">Attendance</button> */}
            </div>
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-stretch bg-white h-80 max-h-80 w-full px-7 rounded-[20px] border border-[#A5A5A5] mt-4">
                {/* Performance page */}
                {page === "Performance" ? (
                    <>
                        <div className="h-full w-full md:w-1/2 py-auto">
                            {/* Donut Chart */}
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
                                            {questionTypeMap[question.type]}
                                        </p>
                                        <p className="text-lg font-semibold">{question.average}</p>
                                    </div>
                                    <p className="text-base pt-2">{question.title}</p>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div />
                )}
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
                        {students.map((student, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="max-w-[200px] truncate">
                                    <p className="text-base">{student.name}</p>
                                    <p className="text-medium">
                                        {student.email ?? "No email provided"}
                                    </p>
                                </TableCell>
                                <TableCell className="max-w-1/5 truncate">A123456789</TableCell>
                                <TableCell className="max-w-1/5 truncate">
                                    <p
                                        className={`rounded-sm p-1 px-2 w-fit text-sm ${
                                            student.attendance <= 50
                                                ? "bg-[#FFA1A1]"
                                                : student.attendance > 50 &&
                                                    student.attendance <= 75
                                                  ? "bg-[#F8ECA1]"
                                                  : "bg-[#BFF2A6]"
                                        }`}
                                    >
                                        {student.attendance}%
                                    </p>
                                </TableCell>
                                <TableCell className="max-w-1/5 truncate">
                                    <p
                                        className={`rounded-sm p-1 px-2 w-fit text-sm ${
                                            student.pollScore <= 50
                                                ? "bg-[#FFA1A1]"
                                                : student.pollScore > 50 && student.pollScore <= 75
                                                  ? "bg-[#F8ECA1]"
                                                  : "bg-[#BFF2A6]"
                                        }`}
                                    >
                                        {student.pollScore}%
                                    </p>
                                </TableCell>
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
