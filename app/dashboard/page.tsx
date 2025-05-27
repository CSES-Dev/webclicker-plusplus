"use client";

import { Course, Role, Schedule } from "@prisma/client";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AddEditCourseForm } from "@/components/AddEditCourseForm";
import CourseCard from "@/components/ui/CourseCard";
import {
    DeleteAlertDialog,
    DeleteAlertDialogAction,
    DeleteAlertDialogCancel,
    DeleteAlertDialogContent,
    DeleteAlertDialogDescription,
    DeleteAlertDialogFooter,
    DeleteAlertDialogHeader,
    DeleteAlertDialogTitle,
} from "@/components/ui/delete-alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { dayLabels, daysOptions } from "@/lib/constants";
import { getUserCourses } from "@/services/userCourse";

interface CourseWithSchedule extends Course {
    schedules: Schedule[];
}

export default function Page() {
    const session = useSession();
    const [courses, setCourses] = useState<(CourseWithSchedule & { role: Role })[]>([]);
    const [role, setRole] = useState<Role>("STUDENT");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentCourseId, setCurrentCourseId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const user = session?.data?.user ?? { id: "", firstName: "" };

    const fetchCourses = async () => {
        try {
            const courseInfo = await getUserCourses(user.id);
            setCourses(courseInfo || []);
        } catch (err) {
            console.error("Error fetching courses", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch courses",
            });
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            setRole((localStorage.getItem("userRole") ?? "STUDENT") as Role);
        }
        void fetchCourses();
    }, [user.id]);

    const handleDeleteInitiated = (courseId: number) => {
        setCurrentCourseId(courseId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!currentCourseId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/updateCourse/${currentCourseId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            toast({
                title: "Success",
                description:
                    courses.find((c) => c.id === currentCourseId)?.role === "LECTURER"
                        ? "Course deleted successfully"
                        : "Successfully left course",
            });

            setCourses((prev) => prev.filter((c) => c.id !== currentCourseId));
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to delete course",
            });
            await fetchCourses();
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setCurrentCourseId(null);
        }
    };

    const handleCancelDelete = () => {
        if (!isDeleting) {
            setIsDeleteDialogOpen(false);
            setCurrentCourseId(null);
        }
    };

    const handleAlertDialogActionClick = async () => {
        await confirmDelete();
    };

    return (
        <div className="w-full flex flex-col justify-center items-center pt-10">
            <div className="w-full px-4 md:px-8 max-w-[1800px] mx-auto">
                <div className="hidden md:block justify-between pb-8">
                    <h1 className="text-[40px] leading-[48px] font-normal text-[#333]">
                        Welcome Back, {user.firstName}!
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 py-8">
                    {/* Create/Join Course Card */}
                    <div className="flex justify-center">
                        {role === "LECTURER" ? (
                            <AddEditCourseForm
                                mode="add"
                                onSuccess={() => {
                                    void fetchCourses();
                                }}
                            />
                        ) : (
                            <Link
                                href="/dashboard/join-course"
                                className="flex flex-col w-80 h-56 rounded-md shadow-lg border border-gray-300"
                            >
                                <div className="bg-primary h-[40%] w-full rounded-t-md"></div>
                                <div className="h-[60%] w-full bg-gray-50 flex items-center justify-center rounded-b-md">
                                    <p className="flex text-lg font-medium text-primary gap-1 items-center">
                                        Join Course <Plus />
                                    </p>
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Course Cards */}
                    {courses.map((course) => (
                        <div key={course.id} className="flex justify-center">
                            <CourseCard
                                color={course.color ?? ""}
                                days={
                                    course.schedules?.[0]?.dayOfWeek.map(
                                        (item) =>
                                            dayLabels[item as (typeof daysOptions)[number]] as
                                                | "M"
                                                | "T"
                                                | "W"
                                                | "Th"
                                                | "F",
                                    ) ?? []
                                }
                                title={course.title ?? "Unknown"}
                                timeStart={course.schedules?.[0]?.startTime ?? ""}
                                timeEnd={course.schedules?.[0]?.endTime ?? ""}
                                code={course.code ?? ""}
                                role={course.role ?? "STUDENT"}
                                id={course.id}
                                onEdit={() => void fetchCourses()}
                                onDelete={() => {
                                    handleDeleteInitiated(course.id);
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteAlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCancelDelete();
                    }
                }}
            >
                <DeleteAlertDialogContent className="bg-white">
                    <DeleteAlertDialogHeader>
                        <DeleteAlertDialogTitle>Are you sure?</DeleteAlertDialogTitle>
                        <DeleteAlertDialogDescription>
                            {courses.find((c) => c.id === currentCourseId)?.role === "LECTURER"
                                ? "This will permanently delete the course and all its data."
                                : "This will remove you from the course."}
                        </DeleteAlertDialogDescription>
                    </DeleteAlertDialogHeader>
                    <DeleteAlertDialogFooter>
                        <DeleteAlertDialogCancel disabled={isDeleting} onClick={handleCancelDelete}>
                            Cancel
                        </DeleteAlertDialogCancel>
                        <DeleteAlertDialogAction
                            onClick={() => {
                                void handleAlertDialogActionClick();
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting
                                ? "Processing..."
                                : courses.find((c) => c.id === currentCourseId)?.role === "LECTURER"
                                  ? "Delete Course"
                                  : "Leave Course"}
                        </DeleteAlertDialogAction>
                    </DeleteAlertDialogFooter>
                </DeleteAlertDialogContent>
            </DeleteAlertDialog>
        </div>
    );
}
