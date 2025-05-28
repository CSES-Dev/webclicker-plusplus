import React, { useEffect, useState } from "react";
import { ChartContainer } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { attendanceChartConfig } from "@/lib/constants";
import { getAttendanceByDay } from "@/services/userCourse";
import { useToast } from "@/hooks/use-toast";

interface Props {
    courseId: number;
}

export default function AttendanceLineChart({ courseId }: Props) {
    const [weekStart, setWeekStart] = useState(dayjs().startOf("week").toDate());
    const [chartData, setChartData] = useState<{ date: string; attendance: number }[]>();
    const { toast } = useToast();

    useEffect(() => {
        const fetchWeekData = async (start: Date) => {
            const week: { date: string; attendance: number }[] = [];
            for (let i = 0; i < 7; i++) {
                const day = dayjs(start).add(i, "day");
                let attendance = 0;
                await getAttendanceByDay(courseId, day.toDate())
                    .then((res) => {
                        if (typeof res !== "number" && "error" in res) {
                            return toast({
                                variant: "destructive",
                                description: res?.error ?? "Unknown error occurred.",
                            });
                        } else {
                            attendance = Number(res);
                        }
                    })
                    .catch((err: unknown) => {
                        console.error(err);
                        return toast({
                            variant: "destructive",
                            description: "Unknown error occurred.",
                        });
                    });
                week.push({
                    date: day.format("M/D"),
                    attendance,
                });
            }
            setChartData(week);
        };
        fetchWeekData(weekStart);
    }, [weekStart]);

    const handleNextWeek = () => {
        setWeekStart((prev) => dayjs(prev).add(7, "day").toDate());
    };
    const handlePrevWeek = () => {
        setWeekStart((prev) => dayjs(prev).subtract(7, "day").toDate());
    };
    return (
        <div className="flex flex-row justify-center items-end px-auto w-full p-3">
            <button
                onClick={handlePrevWeek}
                className="h-8 min-w-24 px-3 bg-[hsl(var(--primary))] text-white rounded-lg focus:outline-none"
            >
                Previous
            </button>
            <ChartContainer config={attendanceChartConfig} className="w-full h-72">
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
                            tick={{ fontSize: 14 }}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={2}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Line
                            dataKey="attendance"
                            type="basis"
                            stroke="#3ce0d5"
                            strokeWidth={2}
                            dot={false}
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
