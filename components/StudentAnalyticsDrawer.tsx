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


export const StudentAnalyticsDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

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
          <div className="text-2xl">Kim Taehyung</div>
        </div>

        {/* Performance Summary */}
        <div className="px-10 py-3">
            <span className="text-lg font-medium">Student's Performance</span>
            <div className="p-4 rounded-md border flex justify-between">
                <div className="flex justify-between items-center gap-4">
                    <div className="w-[160px] h-[160px]">
                        <DonutChart
                            chartData={[
                            { name: "Correct", value: 85, fill: "#BFF2A7" },
                            { name: "Incorrect", value: 15, fill: "#FFFFFF" },
                            ]}
                            chartConfig={{
                            Correct: { label: "Correct", color: "#BFF2A7" },
                            Incorrect: { label: "Incorrect", color: "#CCCCCC" },
                            }}
                            dataKey="value"
                            nameKey="name"
                            description="Average Poll Score"
                            descriptionStatistic={85}
                        />
                    </div>
                    <div className="grid gap-y-4">
                        <div className="bg-[#E9FFDE] text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                            Multiple Choice: 
                            <div className="text-lg">85%</div>
                        </div>
                        <div className="bg-[#E9FFDE] text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                            Multi-Select: 
                            <div className="text-lg">85%</div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="w-[160px] h-[160px]">
                        <DonutChart
                            chartData={[
                            { name: "Attended", value: 90, fill: "#A7F2C2" },
                            { name: "Missed", value: 10, fill: "#FFFFFF" },
                            ]}
                            chartConfig={{
                            Attended: { label: "Attended", color: "#A7F2C2" },
                            Missed: { label: "Missed", color: "#E5E7EB" },
                            }}
                            dataKey="value"
                            nameKey="name"
                            description="Attendance"
                            descriptionStatistic={90}
                        />
                    </div>
                    <div className="grid gap-y-4">
                        <div className="text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                            Last Check-in: 
                            <div className="text-lg">1/16</div>
                        </div>
                        <div className="text-center px-4 py-2 rounded-md text-xs border shadow-lg">
                            Check-ins: 
                            <div className="text-lg">5</div>
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
                <span className="text-sm">1/13</span>
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
                {[...Array(5)].map((_, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-2">
                        {/* Question */}
                        <div className="flex flex-col border rounded-md py-10">
                            <div className="text-lg items-center justify-center text-center">
                                Who is Ash's partner in Pokémon?
                            </div>
                            <div className="flex justify-end">
                                <div className="text-xs bg-[#EDEDED] rounded text-[#5C0505] px-1 py-1">
                                    Multi-Select
                                </div>
                            </div>
                        </div>

                        {/* Inputted */}
                        <div className="border rounded-md text-lg flex items-center justify-center text-center">
                            Pikachu
                        </div>

                        {/* Correct */}
                        <div className="border rounded-md text-lg flex items-center justify-center text-center">
                            Pikachu
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