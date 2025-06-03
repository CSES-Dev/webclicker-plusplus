"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";
import useAccess from "@/hooks/use-access";
import { useToast } from "@/hooks/use-toast";
import { coursePages } from "@/lib/constants";
import { getCourseWithId } from "@/services/course";

export default function CourseInfoLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const params = useParams();
    const path = usePathname();
    const courseId = parseInt(params.courseId as string);
    const { hasAccess, isLoading: isAccessLoading } = useAccess({ courseId, role: "LECTURER" });
    const { toast } = useToast();
    const [courseInfo, setCourseInfo] = useState<{ name: string; code: string }>({
        name: "",
        code: "",
    });

    useEffect(() => {
        if (isAccessLoading) {
            return;
        }
        if (!isAccessLoading && !hasAccess) {
            toast({ variant: "destructive", description: "Access denied!" });
            router.push("/dashboard");
            return;
        }
        const fetchCourseName = async () => {
            try {
                const res = await getCourseWithId(courseId);
                if ("error" in res) {
                    return toast({
                        variant: "destructive",
                        description: "Unable to fetch course information",
                    });
                } else {
                    setCourseInfo({ name: res.title, code: res.code });
                }
            } catch (err) {
                console.error(err);
                toast({
                    variant: "destructive",
                    description: "Unknown error occurred.",
                });
            }
        };
        void fetchCourseName();
    }, [isAccessLoading, hasAccess, courseId]);

    if (isAccessLoading || !hasAccess) {
        return <GlobalLoadingSpinner />;
    }

    return (
        <>
            <h1 className="text-2xl font-normal">{`${courseInfo?.name} (${courseInfo?.code})`} </h1>
            <div className="border-b border-gray-200 flex flex-row gap-4 mt-6 mb-4">
                {coursePages.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            if (tab === "Analytics") {
                                router.push(`/dashboard/course/${courseId}/analytics`);
                            } else {
                                router.push(`/dashboard/course/${courseId}/questionnaire`);
                            }
                        }}
                        className={`pb-2 text-base font-medium ${
                            path.includes(tab.toLowerCase()) ? "text-[#1441DB]" : "text-slate-600"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <main className="flex-1 bg-gray-50 overflow-y-auto">{children}</main>
        </>
    );
}
