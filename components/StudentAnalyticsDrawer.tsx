"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "./ui/sheet";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Input } from "./ui/input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DatePicker } from "@/components/ui/DatePicker";
import DonutChart from "@/components/ui/DonutChart";
import { useEffect } from "react";
import { getStudentAnalytics, getQuestionsAndResponsesForDate } from "@/services/analytics";


export const StudentAnalyticsDrawer = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const courseId = 22 // replace with real course ID
    const userId = "cm8143diq0000i09nnuzne2jo" // replace with real user ID
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
        getStudentAnalytics(courseId, userId)
          .then(setAnalyticsData)
          .catch((err) => {
            console.error("Failed to load analytics", err);
          });
      }, []);

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
          const data = await getQuestionsAndResponsesForDate(courseId, userId, selectedDate);
          setQuestionsForDate(data);
        };
        void fetchQuestions();
      }, [selectedDate]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Open Student Analytics</Button>
      </SheetTrigger>
      <SheetContent className="w-[800px] max-w-full flex flex-col p-0">
        <VisuallyHidden>
            <SheetTitle>Student Analytics</SheetTitle>
        </VisuallyHidden>

        {/* Student Name */}
        <div className="bg-[#F2F5FF] w-fit px-10 py-3 rounded-br-md border-b border-r">
          <span className="text-primary text-lg">Student</span>
          <div className="text-2xl">{analyticsData?.fullName ?? "Loading..."}</div>
        </div>

        {/* Performance Summary */}
        <div className="px-10 py-3">
            <span className="text-lg font-medium">Student's Performance</span>
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
                            chartConfig={{
                                Correct: { label: "Correct", color: "#BFF2A7" },
                                Incorrect: { label: "Incorrect", color: "#FFFFFF" },
                                }}
                            dataKey="value"
                            nameKey="name"
                            description="Average Poll Score"
                            descriptionStatistic={analyticsData?.averagePollScore ?? 0}
                        />
                    </div>
                    <div className="grid gap-y-4">
                        <div className="bg-[#E9FFDE] text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                            Multiple Choice: 
                            <div className="text-lg">{analyticsData?.mcqScore ?? "--"}%</div>
                        </div>
                        <div className="bg-[#E9FFDE] text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                            Multi-Select: 
                            <div className="text-lg">{analyticsData?.msqScore ?? "--"}%</div>
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
                            chartConfig={{
                                Correct: { label: "Attended", color: "#A7F2C2" },
                                Incorrect: { label: "Missed", color: "#FFFFFF" },
                                }}
                            dataKey="value"
                            nameKey="name"
                            description="Attendance"
                            descriptionStatistic={analyticsData?.attendancePercentage ?? 0}
                        />
                    </div>
                    <div className="grid gap-y-4">
                        <div className="text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                            Last Check-in: 
                            <div className="text-lg">{analyticsData?.lastCheckInDate ?? "--"}</div>
                        </div>
                        <div className="text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                            Check-ins: 
                            <div className="text-lg">{analyticsData?.totalCheckIns ?? "--"}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Date Selector */}
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

        <div className="flex px-10 gap-2">
            {/* Div A: Date + Vertical Line */}
            <div className="flex items-center gap-2">
            <span className="text-sm">
                {format(selectedDate, "M/dd")}
            </span>                
            <div className="w-0.5 h-full bg-primary rounded-full"></div>
            </div>

            {/* Div B: Questions + Answers */}
            <div className="flex-1 space-y-2">
                {/* Div 1: Header Row */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="border bg-[#F2F5FF] text-center rounded-md py-1 text-lg">Question:</div>
                    <div className="border bg-[#F2F5FF] text-center rounded-md py-1 text-lg">Inputted:</div>
                    <div className="border bg-[#F2F5FF] text-center rounded-md py-1 text-lg">Correct Answer:</div>
                </div>

                {/* Div 2: Content Rows */}
                <div className="space-y-2 max-h-72 overflow-y-auto">
                    {questionsForDate.map((question, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col border rounded-md py-10 relative">
                        <div className="text-lg text-center px-2">{question.text}</div>
                        <div className="absolute bottom-2 right-2">
                            <span className="text-xs bg-[#EDEDED] rounded text-[#5C0505] px-2 py-1">
                            {question.type === "MCQ" ? "Multiple Choice" : "Multi-Select"}
                            </span>
                        </div>
                        </div>
                        <div className="border rounded-md text-lg flex items-center justify-center text-center">
                        {question.inputtedAnswers
                            .map((optId) => question.options.find(o => o.id === optId)?.text)
                            .join(", ") || "—"}
                        </div>
                        <div className="border rounded-md text-lg flex items-center justify-center text-center">
                        {question.correctAnswers
                            .map((optId) => question.options.find(o => o.id === optId)?.text)
                            .join(", ")}
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};