import { ChartConfig } from "@/components/ui/chart";

export const performanceChartConfig = {
    count: {
        label: "Count",
    },
    correct: {
        label: "Correct",
        color: "green",
    },
    incorrect: {
        label: "Incorrect",
        color: "gray",
    },
} satisfies ChartConfig;

export const attendanceChartConfig = {
    attendance: {
        label: "Attendance",
        color: "black",
    },
} satisfies ChartConfig;

export const studentAnalyticsScoreChartConfig = {
    Correct: { label: "Correct", color: "#BFF2A7" },
    Incorrect: { label: "Incorrect", color: "#FFFFFF" },
} satisfies ChartConfig;

export const studentAnalyticsAttendanceChartConfig = {
    Correct: { label: "Attended", color: "#A7F2C2" },
    Incorrect: { label: "Missed", color: "#FFFFFF" },
} satisfies ChartConfig;
