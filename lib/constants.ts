export const colorOptions = ["#ED9D9D", "#F3AB7E", "#EEF583", "#94ED79", "#8E87F2"];

export const daysOptions = ["M", "T", "W", "Th", "F"] as const;

export const dayLabels: Record<(typeof daysOptions)[number], string> = {
    M: "Monday",
    T: "Tuesday",
    W: "Wednesday",
    Th: "Thursday",
    F: "Friday",
};
