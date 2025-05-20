import { ChartConfig } from "@/components/ui/chart";

export const questionTypes = ["Multiple Choice", "Select All"] as const;
export const colorOptions = ["#ED9D9D", "#F3AB7E", "#EEF583", "#94ED79", "#8E87F2"];

export const daysOptions = ["M", "T", "W", "Th", "F"] as const;

export const dayLabels: Record<(typeof daysOptions)[number], string> = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
};

export const questionTypeMap = {
    MSQ: "Select All That Apply",
    MCQ: "Multiple Choice",
};

// donut chart config
export const dataKey = "count";
export const nameKey = "result";
export const description = "Class Average";
export const chartConfig = {
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

export const analyticsPages = ['Performance', 'Attendance']


export const DEFAULT_SHOW_RESULTS = false;