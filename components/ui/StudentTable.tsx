import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getStudents } from "@/services/userCourse";
import { getAllSessionIds } from "@/services/session";
import { getStudentsWithScores } from "@/lib/utils";
import { GlobalLoadingSpinner } from "./global-loading-spinner";

interface Props {
    courseId: number;
}
export default function StudentTable({ courseId }: Props) {
    const [students, setStudents] = useState<
        {
            name: string;
            email: string | null;
            attendance: number;
            pollScore: number;
        }[]
    >([]);
    const [studentQuery, setStudentQuery] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchStudentData = async () => {
            setIsLoading(true);
            await getStudents(courseId, studentQuery)
                .then(async (studentData) => {
                    if ("error" in studentData)
                        return toast({
                            variant: "destructive",
                            description: studentData?.error ?? "Unknown error occurred.",
                        });
                    else {
                        await getAllSessionIds(courseId).then((sessions) => {
                            if ("error" in sessions) {
                                return toast({
                                    variant: "destructive",
                                    description: sessions?.error ?? "Unknown error occurred.",
                                });
                            } else {
                                setStudents(getStudentsWithScores(studentData, sessions));
                            }
                        });
                    }
                })
                .catch((err: unknown) => {
                    console.error(err);
                    return toast({
                        variant: "destructive",
                        description: "Unknown error occurred.",
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        };
        void fetchStudentData();
    }, [studentQuery]);

    if (isLoading) {
        return <GlobalLoadingSpinner />;
    }

    return (
        <div className="bg-white h-fit max-h-96 rounded-[20px] border border-[#A5A5A5] mt-4 overflow-y-auto">
            <Table className="relative rounded-[20px] w-full mb-5">
                {students?.length === 0 && <TableCaption>No students enrolled</TableCaption>}
                <TableHeader className="h-14">
                    <TableRow>
                        <TableHead key={"name"} className="pl-6 w-4/12">
                            Student
                        </TableHead>
                        <TableHead key={"attendance"} className="w-2/12">
                            Attendance
                        </TableHead>
                        <TableHead key={"score"} className="w-3/12">
                            Poll Score
                        </TableHead>
                        <TableHead key={"activity"} className="w-1/2 pr-6">
                            <input
                                onChange={(e) => {
                                    setStudentQuery(e.target.value);
                                }}
                                type="text"
                                placeholder="Search student..."
                                className="h-8 w-full md:max-w-[12vw] px-3 bg-white text-black border border-slate-300 rounded-lg focus:outline-none"
                            />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((student, idx) => (
                        <TableRow key={idx}>
                            <TableCell className="max-w-1/3 pl-6 truncate">
                                <p className="text-base">{student.name}</p>
                                <p className="text-medium">
                                    {student.email ?? "No email provided"}
                                </p>
                            </TableCell>
                            <TableCell className="max-w-1/6 truncate">
                                <p
                                    className={`rounded-sm p-1 px-2 w-fit text-sm ${
                                        student.attendance <= 50
                                            ? "bg-[#FFA1A1]"
                                            : student.attendance > 50 && student.attendance <= 75
                                              ? "bg-[#F8ECA1]"
                                              : "bg-[#BFF2A6]"
                                    }`}
                                >
                                    {student.attendance}%
                                </p>
                            </TableCell>
                            <TableCell className="max-w-1/4 truncate">
                                <p
                                    className={`rounded-sm p-1 px-2 w-fit text-sm ${
                                        student.pollScore <= 50
                                            ? "bg-[#FFA1A1]"
                                            : student.pollScore > 50 && student.pollScore <= 75
                                              ? "bg-[#F8ECA1]"
                                              : "bg-[#BFF2A6]"
                                    }`}
                                >
                                    {student.pollScore}%
                                </p>
                            </TableCell>
                            <TableCell>
                                <div className="w-1/2 pr-6">
                                    <button className="w-32 h-8 bg-white border border-[#A5A5A5] hover:bg-slate-100 rounded-md">
                                        View Activity →
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
