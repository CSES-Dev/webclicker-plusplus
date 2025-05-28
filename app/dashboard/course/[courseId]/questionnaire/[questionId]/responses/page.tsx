import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
    params: {
        courseId: string;
        questionId: string;
    };
}

export default async function QuestionResponsesPage({ params }: Props) {
    const questionId = parseInt(params.questionId);
    const courseId = parseInt(params.courseId);

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
            options: true,
            responses: {
                include: {
                    option: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            },
            session: {
                select: {
                    startTime: true,
                    course: {
                        select: {
                            title: true,
                            users: {
                                where: {
                                    role: "STUDENT",
                                },
                                select: {
                                    userId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!question) {
        return notFound();
    }

    const totalStudents = question.session.course.users.length;
    const answeredStudents = question.responses.length;
    const correctPercentage =
        (question.responses.filter((r) => r.option.isCorrect).length / answeredStudents) * 100 || 0;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Link
                    href={`/dashboard/course/${courseId}/questionnaire`}
                    className="flex items-center text-[#18328D] hover:text-[#142974] transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Past Questions
                </Link>
            </div>

            {/* Header section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <span className="text-sm font-medium text-gray-500">
                        {questionTypeMap[question.type]} •{" "}
                        {new Date(question.session.startTime).toLocaleDateString()}
                    </span>
                </div>
                <div className="text-sm font-medium text-gray-700">
                    Total Students Answered: {answeredStudents}/{totalStudents}
                </div>
            </div>

            {/* Question box */}
            <div className="bg-white rounded-lg shadow p-6 mb-8 border border-gray-200">
                <h1 className="text-2xl font-semibold mb-6">{question.text}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Answer choices */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Answer Choices</h3>
                        <div className="space-y-4">
                            {question.options.map((option) => {
                                const count = question.responses.filter(
                                    (r) => r.optionId === option.id,
                                ).length;
                                const percentage =
                                    answeredStudents > 0
                                        ? Math.round((count / answeredStudents) * 100)
                                        : 0;

                                return (
                                    <div key={option.id} className="space-y-1">
                                        <div className="flex justify-between">
                                            <span
                                                className={`font-medium ${option.isCorrect ? "text-[#2D9B62]" : ""}`}
                                            >
                                                {option.text} {option.isCorrect && "(Correct)"}
                                            </span>
                                            <span>
                                                {percentage}% ({count})
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${option.isCorrect ? "bg-green-500" : "bg-blue-500"}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Class average circle */}
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-medium mb-4">Class Average</h3>
                        <div className="relative w-52 h-52">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="8"
                                />
                                {/* Progress circle - only show if percentage > 0 */}
                                {correctPercentage > 0 && (
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#2D9B62"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${correctPercentage * 2.83} 283`}
                                        strokeDashoffset="0"
                                        transform="rotate(-90 50 50)"
                                    />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-gray-800">
                                    {Math.round(correctPercentage)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student responses table */}
            <div className="bg-white rounded-lg border border-[#D9D9D9] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        {" "}
                        <thead className="bg-[#F2F5FF]">
                            <tr>
                                <th className="px-6 py-3 text-center text-sm font-medium text-[#434343] uppercase border-b border-[#D9D9D9] border-r">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-medium text-[#434343] uppercase border-b border-[#D9D9D9] border-r">
                                    Answer Provided
                                </th>
                                <th className="px-6 py-3 text-center text-sm font-medium text-[#434343] uppercase border-b border-[#D9D9D9]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {question.responses.map((response, index) => {
                                const isCorrect = response.option.isCorrect;
                                const fullName =
                                    `${response.user.firstName} ${response.user.lastName || ""}`.trim();

                                return (
                                    <tr key={index} className="border-b border-[#D9D9D9]">
                                        <td className="px-6 py-4 text-center border-r border-[#D9D9D9]">
                                            <div>
                                                <div className="text-sm font-medium text-[#1F1F1F]">
                                                    {fullName}
                                                </div>
                                                <div className="text-sm text-[#666666]">
                                                    {response.user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center border-r border-[#D9D9D9]">
                                            <div className="text-sm text-[#1F1F1F]">
                                                {response.option.text}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span
                                                className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-md 
                  ${isCorrect ? "bg-[#E6F6EC] text-[#067647]" : "bg-[#FEE9E9] text-[#D12929]"}`}
                                            >
                                                {isCorrect ? "Correct" : "Incorrect"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const questionTypeMap = {
    MCQ: "Multiple Choice",
    MSQ: "Multiple Select",
};
