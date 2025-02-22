<<<<<<< HEAD
export const questionTypes = ["Multiple Choice", "Select All", "Free Response"]
=======
export const colorOptions = ["#ED9D9D", "#F3AB7E", "#EEF583", "#94ED79", "#8E87F2"];

export const daysOptions = ["M", "T", "W", "Th", "F"] as const;

export const dayLabels: Record<(typeof daysOptions)[number], string> = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
};
>>>>>>> 523bd9bc198649595d10957cb46995c16c5534b3
