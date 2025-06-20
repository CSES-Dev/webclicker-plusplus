import { $Enums } from "@prisma/client";
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

export const questionTypeColors = {
    MSQ: { bg: "#FFFED3", fg: "#58560B" },
    MCQ: { bg: "#EBCFFF", fg: "#602E84" },
};

// donut chart config
export const dataKey = "count";
export const nameKey = "result";
export const description = "Class Average";
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

export const analyticsPages = ["Performance", "Attendance Rate"];
export const coursePages = ["Questionnaire", "Analytics"];

export const DEFAULT_SHOW_RESULTS = false;

export type QuestionWithResponesAndOptions = {
    options: {
        isCorrect: boolean;
        text: string;
        id: number;
        questionId: number;
    }[];
    responses: {
        userId: string;
        questionId: number;
        optionId: number;
        answeredAt: Date;
    }[];
} & {
    text: string;
    id: number;
    type: $Enums.QuestionType;
    sessionId: number;
    position: number;
};

export type Response = {
    options: {
        isCorrect: boolean;
        id: number;
        text: string;
        questionId: number;
    }[];
    responses: {
        optionId: number;
        questionId: number;
        userId: string;
        answeredAt: Date;
    }[];
};

export type Student = {
    id: string;
    responses: {
        question: {
            sessionId: number;
            options: {
                isCorrect: boolean;
            }[];
        };
    }[];
    email: string | null;
    firstName: string;
    lastName: string | null;
};

export const csvBasicFieldNames = ["email", "num_questions_answered", "date_of_session"];
export const csvAdvancedFieldNames = [
    "email",
    "question",
    "answer",
    "is_correct",
    "date_of_session",
];
