import React, { useEffect, useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { attendanceChartConfig } from "@/lib/constants";
import { calculateWeekAttendance } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import useDebounce from "@/hooks/use-debounce";

interface Props {
    courseId: number;
    setIsLoading: (isLoading: boolean) => void;
}

export default function AttendanceLineChart({ courseId, setIsLoading }: Props) {
    const [weekStart, setWeekStart] = useState<Date>(dayjs().startOf("week").toDate());
    let debouncedWeekStart = useDebounce<Date>(weekStart, 2000);
    const [chartData, setChartData] = useState<{ date: string; attendance: number }[]>();
    const { toast } = useToast();

    useEffect(() => {
        const fetchWeekData = async (start: Date) => {
            await calculateWeekAttendance(start, courseId)
                .then((res) => {
                    if (res && "error" in res) {
                        toast({
                            variant: "destructive",
                            description: res.error ?? "Unknown error occurred",
                        });
                    } else {
                        setChartData(res);
                    }
                })
                .catch((err: unknown) => {
                    console.error(err);
                    toast({ variant: "destructive", description: "Unknown error occurred" });
                });
        };
        fetchWeekData(debouncedWeekStart);
    }, [debouncedWeekStart]);

    const handleNextWeek = () => {
        setWeekStart(dayjs(weekStart).add(7, "day").toDate());
    };
    const handlePrevWeek = () => {
        setWeekStart(dayjs(weekStart).subtract(7, "day").toDate());
    };
    return (
        <div className="flex flex-row justify-center items-end px-auto w-full p-3">
            <button
                onClick={handlePrevWeek}
                className="h-8 min-w-24 px-3 bg-[hsl(var(--primary))] text-white rounded-lg focus:outline-none"
            >
                Previous
            </button>
            <ChartContainer config={attendanceChartConfig} className="w-full h-80">
                <ResponsiveContainer width="100%" height={"250px"}>
                    <LineChart
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 14 }}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `${value}`}
                        />
                        <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 14 }}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={2}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Line
                            dataKey="attendance"
                            type="linear"
                            stroke="#3ce0d5"
                            strokeWidth={2}
                            dot={{
                                fill: "#3ce0d5",
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
            <button
                onClick={handleNextWeek}
                className="h-8 min-w-24 px-3 bg-[hsl(var(--primary))] text-white rounded-lg focus:outline-none ml-6"
            >
                Next
            </button>
        </div>
    );
}
