"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarComponent } from "@/components/ui/calendar";
import { Visualization } from "@/components/ui/visualization";

export default function Home() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedChart, setSelectedChart] = useState<"bar" | "pie">("bar");

    // Simulated data based on selected date
    const getDataForDate = (date: Date) => {
        const dateKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
        const dataMap: Record<string, number> = {
            "2025-02-06": 75,
            "2025-02-07": 90,
            "2025-02-08": 60,
        };
        return dataMap[dateKey] || 50; // Default value if no data exists
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">WebClicker++</h1>

            {/* Calendar Component */}
            <CalendarComponent onDateSelect={setSelectedDate} />

            {/* Buttons for Chart Selection */}
            <div className="flex gap-4 my-6">
                <Button
                    variant={selectedChart === "bar" ? "default" : "outline"}
                    onClick={() => {
                        setSelectedChart("bar");
                    }}
                >
                    Show Bar Chart
                </Button>
                <Button
                    variant={selectedChart === "pie" ? "default" : "outline"}
                    onClick={() => {
                        setSelectedChart("pie");
                    }}
                >
                    Show Pie Chart
                </Button>
            </div>

            {/* Visualization Component */}
            <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
                <Visualization
                    type={selectedChart}
                    value={getDataForDate(selectedDate)}
                    label={selectedChart === "bar" ? "Performance" : "Attendance"}
                />
            </div>
        </div>
    );
}
