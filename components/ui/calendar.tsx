"use client";

import { addDays, format, startOfWeek } from "date-fns";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

export type CalendarProps = {
    onDateSelect: (date: Date) => void;
};

export function CalendarComponent({ onDateSelect }: CalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 })); // Start week on Sunday

    // Function to select a date
    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        onDateSelect(date);
    };

    // Move to the previous week
    const previousWeek = () => {
        setWeekStart(addDays(weekStart, -7));
    };

    // Move to the next week
    const nextWeek = () => {
        setWeekStart(addDays(weekStart, 7));
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-[90%] flex flex-col justify-between">
            {/* Week Days Display */}
            <div className="grid grid-cols-7 gap-4 text-center w-full">
                {Array.from({ length: 7 }).map((_, index) => {
                    const currentDate = addDays(weekStart, index);
                    const isSelected =
                        format(currentDate, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

                    return (
                        <div
                            key={index}
                            onClick={() => {
                                handleDateChange(currentDate);
                            }}
                            className={`w-16 h-16 flex flex-col items-center justify-center rounded-full cursor-pointer text-lg
                ${isSelected ? "bg-blue-700 text-white font-bold" : "text-gray-700"}
                hover:bg-blue-200 transition`}
                        >
                            <span className="block text-sm">{format(currentDate, "E")}</span>
                            <span className="block text-2xl">{format(currentDate, "dd")}</span>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Buttons (Bottom Right) */}
            <div className="flex justify-end items-center mt-6">
                <Button
                    variant="outline"
                    onClick={previousWeek}
                    disabled={weekStart < new Date(2025, 0, 1)}
                    className="mr-2"
                >
                    Previous
                </Button>
                <Button variant="default" onClick={nextWeek}>
                    Next
                </Button>
            </div>
        </div>
    );
}
