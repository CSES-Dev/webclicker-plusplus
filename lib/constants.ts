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

export const analyticsPages = ["Performance", "Attendance Rate"];
export const coursePages = ["Questionnaire", "Analytics", "Admin"] as const;

export const DEFAULT_SHOW_RESULTS = false;

export const csvBasicFieldNames = ["email", "num_questions_answered", "date_of_session"];
export const csvAdvancedFieldNames = [
    "email",
    "question",
    "answer",
    "is_correct",
    "date_of_session",
];
