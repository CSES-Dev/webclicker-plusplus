"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ExportCSVDropdown } from "@/components/ExportCSVDropdown";
import AttendanceLineChart from "@/components/ui/AttendanceLineChart";
import PerformanceData from "@/components/ui/PerformanceData";
import StudentTable from "@/components/ui/StudentTable";
import { toast } from "@/hooks/use-toast";
import { analyticsPages } from "@/lib/constants";
import { ExportCSVType } from "@/models/ExportCSVType";

export default function Page() {
    const params = useParams();
    const courseId = parseInt((params.courseId as string) ?? "0");
    const [page, setPage] = useState<string>("Performance");

    const downloadCsv = (mode: ExportCSVType) => {
        try {
            const downloadUrl = `/api/export/${courseId}?mode=${mode}`;
            window.open(downloadUrl, "_blank");
        } catch (err) {
            toast({
                variant: "destructive",
                description: "Export failed.",
            });
            console.error("Export error:", err);
        }
    };

    return (
        <div className="w-full flex flex-col">
            <div className="flex flex-row gap-2 bg-slate-200 h-fit w-fit p-1 rounded-md mb-4">
                {analyticsPages.map((pageTitle: string) => (
                    <button
                        key={pageTitle}
                        className={`p-2 h-fit px-4 rounded-md transition-colors duration-300 ease-in-out ${
                            page === pageTitle
                                ? "bg-white text-[#1441DB]"
                                : "bg-slate-200 text-slate-500"
                        }`}
                        onClick={() => {
                            setPage(pageTitle);
                        }}
                    >
                        {pageTitle}
                    </button>
                ))}
            </div>
            {/* Performance and Attendance Data */}
            <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-stretch bg-white overflow-auto h-96 max-h-96 w-full rounded-[20px] border border-[#A5A5A5]">
                {page === "Performance" ? (
                    <PerformanceData courseId={courseId} />
                ) : (
                    <AttendanceLineChart courseId={courseId} />
                )}
            </div>
            <div className="flex flex-row justify-between mt-8 pl-1">
                <h1 className="text-2xl font-normal">Student Data</h1>
                <ExportCSVDropdown onSelect={downloadCsv} />
            </div>
            {/* Student Data Table */}
            <StudentTable courseId={courseId} />
        </div>
    );
}
