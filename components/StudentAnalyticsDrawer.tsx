"use client";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { QuestionResponseTable } from "@/components/QuestionResponseTable";
import { DatePicker } from "@/components/ui/DatePicker";
import DonutChart from "@/components/ui/DonutChart";
import { useToast } from "@/hooks/use-toast";
import {
    studentAnalyticsAttendanceChartConfig,
    studentAnalyticsScoreChartConfig,
} from "@/lib/constants";
import { formatDateToISO } from "@/lib/utils";
import { getQuestionsAndResponsesForDate, getStudentAnalytics } from "@/services/analytics";

type Props = {
    studentId: string | null;
    courseId: number;
};

export const StudentAnalyticsDrawer = ({ studentId, courseId }: Props) => {
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [analyticsData, setAnalyticsData] = useState<{
        fullName: string;
        attendancePercentage: number;
        totalCheckIns: number;
        lastCheckInDate: string | null;
        mcqScore: number;
        msqScore: number;
        averagePollScore: number;
    } | null>(null);

    useEffect(() => {
        if (!studentId) return;
        getStudentAnalytics(courseId, studentId)
            .then(setAnalyticsData)
            .catch((err: unknown) => {
                if (err instanceof Error) {
                    console.error("Failed to load analytics", err);
                } else {
                    console.error("Unknown error occurred");
                }
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load analytics",
                });
            });
    }, [courseId, studentId]);

    type QuestionForDate = {
        id: number;
        text: string;
        type: "MCQ" | "MSQ";
        inputtedAnswers: number[];
        correctAnswers: number[];
        options: { id: number; text: string }[];
    };

    const [questionsForDate, setQuestionsForDate] = useState<QuestionForDate[]>([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!studentId) return;
            const formattedDate = formatDateToISO(selectedDate);
            const data = await getQuestionsAndResponsesForDate(courseId, studentId, formattedDate);
            setQuestionsForDate(data);
        };
        void fetchQuestions();
    }, [selectedDate]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="w-32 h-8 bg-white border border-[#A5A5A5] hover:bg-slate-100 rounded-md">
                    View Activity →
                </button>
            </SheetTrigger>
            <SheetContent className="w-[800px] max-w-full flex flex-col p-0">
                <VisuallyHidden>
                    <SheetTitle>Student Analytics</SheetTitle>
                </VisuallyHidden>

                <div className="bg-[#F2F5FF] w-fit px-10 py-3 rounded-br-md border-b border-r">
                    <span className="text-primary text-lg">Student</span>
                    <div className="text-2xl">{analyticsData?.fullName ?? "Loading..."}</div>
                </div>

                <div className="px-10 py-3">
                    <span className="text-lg font-medium">Student&apos;s Performance</span>
                    <div className="p-4 rounded-md border flex justify-between">
                        <div className="flex justify-between items-center gap-4">
                            <div className="w-[200px] h-[200px]">
                                <DonutChart
                                    chartData={[
                                        {
                                            name: "Correct",
                                            value: analyticsData?.averagePollScore ?? 0,
                                            fill: "#BFF2A7",
                                        },
                                        {
                                            name: "Incorrect",
                                            value: 100 - (analyticsData?.averagePollScore ?? 0),
                                            fill: "#FFFFFF",
                                        },
                                    ]}
                                    chartConfig={studentAnalyticsScoreChartConfig}
                                    dataKey="value"
                                    nameKey="name"
                                    description="Average Poll Score"
                                    descriptionStatistic={analyticsData?.averagePollScore ?? 0}
                                />
                            </div>
                            <div className="grid gap-y-4">
                                <div className="bg-[#E9FFDE] text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                                    Multiple Choice:
                                    <div className="text-lg">
                                        {analyticsData?.mcqScore ?? "--"}%
                                    </div>
                                </div>
                                <div className="bg-[#E9FFDE] text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                                    Multi-Select:
                                    <div className="text-lg">
                                        {analyticsData?.msqScore ?? "--"}%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-4">
                            <div className="w-[200px] h-[200px]">
                                <DonutChart
                                    chartData={[
                                        {
                                            name: "Attended",
                                            value: analyticsData?.attendancePercentage ?? 0,
                                            fill: "#A7F2C2",
                                        },
                                        {
                                            name: "Missed",
                                            value: 100 - (analyticsData?.attendancePercentage ?? 0),
                                            fill: "#FFFFFF",
                                        },
                                    ]}
                                    chartConfig={studentAnalyticsAttendanceChartConfig}
                                    dataKey="value"
                                    nameKey="name"
                                    description="Attendance"
                                    descriptionStatistic={analyticsData?.attendancePercentage ?? 0}
                                />
                            </div>
                            <div className="grid gap-y-4">
                                <div className="text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                                    Last Check-in:
                                    <div className="text-lg">
                                        {analyticsData?.lastCheckInDate ?? "--"}
                                    </div>
                                </div>
                                <div className="text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                                    Check-ins:
                                    <div className="text-lg">
                                        {analyticsData?.totalCheckIns ?? "--"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-10 flex justify-end">
                    <div className="w-fit">
                        <DatePicker
                            currentDate={selectedDate}
                            onSelect={(date: Date) => {
                                setSelectedDate(date);
                            }}
                        />
                    </div>
                </div>

                <div className="flex px-10 gap-2 min-h-[334px]">
                    <div className="flex items-center gap-2">
                        <span className="text-sm">{format(selectedDate, "M/dd")}</span>
                        <div className="w-0.5 h-full bg-primary rounded-full"></div>
                    </div>

                    <div className="flex-1 space-y-2">
                        {questionsForDate.length === 0 ? (
                            <div className="flex items-center justify-center h-full border rounded-md bg-muted text-muted-foreground text-lg">
                                No questions for this day
                            </div>
                        ) : (
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="border bg-[#F2F5FF] text-center rounded-md py-1 text-lg">
                                        Question:
                                    </div>
                                    <div className="border bg-[#F2F5FF] text-center rounded-md py-1 text-lg">
                                        Inputted:
                                    </div>
                                    <div className="border bg-[#F2F5FF] text-center rounded-md py-1 text-lg">
                                        Correct Answer:
                                    </div>
                                </div>

                                <QuestionResponseTable questions={questionsForDate} />
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
