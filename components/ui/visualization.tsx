"use client";

import React from "react";
import { BarChartSingle } from "./bar-chart";
import { PieChart } from "./pie-chart";

export type VisualizationProps = {
    type: "bar" | "pie"; // This tells the component whether to show a bar or pie chart
    value: number; // This is the numerical value (percentage) for the chart
    label: string; // A label for what the chart represents (e.g., "Performance")
};

export function Visualization({ type, value, label }: VisualizationProps) {
    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            {type === "bar" && <BarChartSingle amount={value} />}
            {type === "pie" && <PieChart value={value} pie_label={label} />}
        </div>
    );
}
