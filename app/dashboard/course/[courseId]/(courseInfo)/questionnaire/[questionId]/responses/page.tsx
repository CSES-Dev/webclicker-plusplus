import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";

interface Props {
    params: {
        courseId: string;
        questionId: string;
    };
}

const questionTypeStyles = {
    MCQ: {
        bgColor: "#FFFED3",
        textColor: "#58560B",
        borderColor: "#58570B",
        label: "Multiple Choice",
    },
    MSQ: {
        bgColor: "#EBCFFF",
        textColor: "#602E84",
        borderColor: "#602E84",
        label: "Select-All",
    },
};

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

export default async function QuestionResponsesPage({ params }: Props) {
    const questionId = parseInt(params.questionId);
    const courseId = parseInt(params.courseId);

    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
            options: {
                orderBy: {
                    id: "asc",
                },
            },
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
                orderBy: {
                    answeredAt: "desc",
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

    const correctOptionIds = question.options
        .filter((option) => option.isCorrect)
        .map((option) => option.id);

    const latestResponseSets = question.responses.reduce((acc, response) => {
        if (!acc.has(response.userId)) {
            const userResponses = question.responses
                .filter((r) => r.userId === response.userId && r.questionId === questionId)
                .sort((a, b) => b.answeredAt.getTime() - a.answeredAt.getTime());

            if (question.type === "MSQ") {
                const latestAnsweredAt = userResponses[0]?.answeredAt;
                const latestSubmission = userResponses.filter(
                    (r) => r.answeredAt.getTime() === latestAnsweredAt?.getTime(),
                );
                acc.set(response.userId, latestSubmission);
            } else {
                acc.set(response.userId, [userResponses[0]]);
            }
        }
        return acc;
    }, new Map<string, typeof question.responses>());

    const allLatestResponses = Array.from(latestResponseSets.values()).flat();

    const studentResults = Array.from(latestResponseSets.entries()).map(([userId, responses]) => {
        if (question.type === "MSQ") {
            const selectedOptionIds = responses.map((r) => r.optionId);
            const isCorrect =
                selectedOptionIds.length === correctOptionIds.length &&
                correctOptionIds.every((id) => selectedOptionIds.includes(id));
            return { userId, isCorrect };
        } else {
            const isCorrect = responses[0]?.option.isCorrect || false;
            return { userId, isCorrect };
        }
    });

    const totalStudents = question.session.course.users.length;
    const answeredStudents = latestResponseSets.size;
    const correctCount = studentResults.filter((r) => r.isCorrect).length;
    const correctPercentage =
        answeredStudents > 0 ? Math.round((correctCount / answeredStudents) * 100) : 0;

    const optionCounts = question.options.map((option) => {
        const count = allLatestResponses.filter((r) => r.optionId === option.id).length;
        return {
            optionId: option.id,
            count,
            percentage: answeredStudents > 0 ? Math.round((count / answeredStudents) * 100) : 0,
        };
    });

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

            {/* Header Section */}
            <section className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-8">
                    <span
                        className="text-sm font-medium px-3 py-1.5 rounded border"
                        style={{
                            backgroundColor: questionTypeStyles[question.type].bgColor,
                            color: questionTypeStyles[question.type].textColor,
                            borderColor: questionTypeStyles[question.type].borderColor,
                            borderWidth: "1px",
                        }}
                    >
                        {questionTypeStyles[question.type].label}
                    </span>
                    <span className="text-2xl font-medium text-[#414141]">
                        {formatDate(question.session.startTime)}
                    </span>
                </div>
                <div className="text-2xl font-normal text-[#414141]">
                    Total Students Answered: {answeredStudents}/{totalStudents}
                </div>
            </section>

            {/* Question/Average Section */}
            <section className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Question and Answer Choices */}
                    <div className="order-1 md:order-none">
                        <h1 className="text-4xl font-normal mb-6 text-[#434343]">
                            {question.text}
                        </h1>
                        <div className="space-y-4">
                            {question.options.map((option) => {
                                const optionCount = optionCounts.find(
                                    (oc) => oc.optionId === option.id,
                                );
                                const count = optionCount?.count || 0;
                                const percentage = optionCount?.percentage || 0;
                                const hasResponses = count > 0;

                                return (
                                    <div key={option.id} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{option.text}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="flex-1 relative">
                                                <div
                                                    className={`w-full rounded-full h-2.5 ${
                                                        !hasResponses
                                                            ? "bg-[#BAC0B9]"
                                                            : option.isCorrect
                                                              ? "bg-[#E6F6EC]"
                                                              : "bg-[#FEE9E9]"
                                                    }`}
                                                >
                                                    {hasResponses && (
                                                        <div
                                                            className={`h-2.5 rounded-full ${
                                                                option.isCorrect
                                                                    ? "bg-[#519546]"
                                                                    : "bg-[#D96363]"
                                                            }`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-600 w-14 text-right">
                                                {percentage}% ({count})
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Circular Progress */}
                    <div className="flex justify-center order-2 md:order-none w-full">
                        {/* Mobile View */}
                        <div className="lg:hidden">
                            <CircularProgress value={correctPercentage} size={180} thickness={18} />
                        </div>
                        {/* Desktop View */}
                        <div className="hidden lg:block">
                            <CircularProgress value={correctPercentage} size={240} thickness={24} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Student Responses Table */}
            <section className="bg-white rounded-xl border border-[#D9D9D9] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <colgroup>
                            <col className="w-1/4" />
                            <col className="w-2/4" />
                            <col className="w-1/4" />
                        </colgroup>
                        <thead className="bg-[#F2F5FF]">
                            <tr>
                                <th className="px-4 py-3 text-center text-xl font-medium text-[#434343] border-b border-[#D9D9D9] border-r">
                                    Student
                                </th>
                                <th className="px-4 py-3 text-center text-xl font-medium text-[#434343] border-b border-[#D9D9D9] border-r">
                                    Answer Provided
                                </th>
                                <th className="px-4 py-3 text-center text-xl font-medium text-[#434343] border-b border-[#D9D9D9]">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from(latestResponseSets.entries()).map(
                                ([userId, responses], index) => {
                                    const firstResponse = responses[0];
                                    const fullName =
                                        `${firstResponse.user.firstName} ${firstResponse.user.lastName || ""}`.trim();

                                    const studentResult = studentResults.find(
                                        (r) => r.userId === userId,
                                    );
                                    const isCorrect = studentResult?.isCorrect || false;

                                    const selectedOptions = responses
                                        .map((r) => r.option.text)
                                        .join(", ");

                                    return (
                                        <tr key={index} className="border-b border-[#D9D9D9]">
                                            <td className="px-4 py-4 border-r border-[#D9D9D9]">
                                                <div className="flex flex-col">
                                                    <div className="text-lg font-normal text-black truncate">
                                                        {fullName}
                                                    </div>
                                                    <div className="text-base text-[#434343] truncate">
                                                        {firstResponse.user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-left border-r border-[#D9D9D9]">
                                                <div className="text-lg text-black font-normal">
                                                    {question.type === "MSQ"
                                                        ? selectedOptions
                                                        : firstResponse.option.text}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-lg leading-5 font-medium rounded-md 
                                                ${isCorrect ? "bg-[#E6F6EC] text-[#067647]" : "bg-[#FEE9E9] text-[#D12929]"}`}
                                                >
                                                    {isCorrect ? "Correct" : "Incorrect"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                },
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
