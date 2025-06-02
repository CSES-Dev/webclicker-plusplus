import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Question, QuestionType } from "@prisma/client";
import Link from "next/link";

const questionTypeStyles = {
    [QuestionType.MCQ]: {
        bgColor: "#FFFED3",
        textColor: "#58560B",
        borderColor: "#58570B",
        label: "Multiple Choice",
    },
    [QuestionType.MSQ]: {
        bgColor: "#EBCFFF",
        textColor: "#602E84",
        borderColor: "#602E84",
        label: "Select-All",
    },
};

interface PastQuestion extends Question {
    session: { startTime: Date };
    options: { id: number; text: string; isCorrect: boolean }[];
    responses: {
        optionId: number;
        user: { firstName: string; lastName?: string };
        answeredAt: string;
    }[];
}

interface Props {
    courseId: number;
}

function PastQuestions({ courseId }: Props) {
    const [questions, setQuestions] = useState<PastQuestion[]>([]);
    const [filterType, setFilterType] = useState<QuestionType | "ALL">("ALL");

    useEffect(() => {
        const fetchPastQuestions = async () => {
            try {
                const response = await fetch(`/api/courses/${courseId}/past-questions`);
                if (!response.ok) throw new Error("Failed to fetch questions");
                const data = await response.json();
                setQuestions(data);
            } catch (error) {
                console.error("Error fetching past questions:", error);
            }
        };

        fetchPastQuestions();
    }, [courseId]);

    const filteredQuestions = questions.filter(
        (question) => filterType === "ALL" || question.type === filterType,
    );

    const calculateScore = (question: PastQuestion) => {
        if (question.responses.length === 0) return 0;

        const correctOptionIds = question.options
            .filter((option) => option.isCorrect)
            .map((option) => option.id);

        const userResponses = new Map<string, number[]>();
        const userResponseTimes = new Map<string, Date>();

        question.responses.forEach((response) => {
            const userId = response.user.firstName + (response.user.lastName || "");
            const responseTime = response.answeredAt ? new Date(response.answeredAt) : new Date(0);

            if (!userResponseTimes.has(userId)) {
                userResponseTimes.set(userId, responseTime);
                userResponses.set(userId, [response.optionId]);
            } else if (responseTime > userResponseTimes.get(userId)!) {
                userResponseTimes.set(userId, responseTime);
                userResponses.set(userId, [response.optionId]);
            } else if (responseTime.getTime() === userResponseTimes.get(userId)?.getTime()) {
                userResponses.get(userId)?.push(response.optionId);
            }
        });

        let correctCount = 0;
        userResponses.forEach((selectedOptionIds, userId) => {
            if (question.type === QuestionType.MSQ) {
                const isCorrect =
                    selectedOptionIds.length === correctOptionIds.length &&
                    correctOptionIds.every((id) => selectedOptionIds.includes(id));
                if (isCorrect) correctCount++;
            } else {
                const isCorrect = question.options.some(
                    (opt) => opt.id === selectedOptionIds[0] && opt.isCorrect,
                );
                if (isCorrect) correctCount++;
            }
        });

        const totalUsers = userResponses.size;
        return totalUsers > 0 ? Math.round((correctCount / totalUsers) * 100) : 0;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US");
    };

    return (
        <div className="flex flex-col items-center space-y-4 w-full">
            <section className="w-full max-w-screen-xl flex justify-between items-center">
                <h1 className="font-medium text-2xl sm:text-4xl text-black">Past Questions</h1>
            </section>

            <div className="w-full max-w-screen-xl bg-white rounded-[20px] border border-[#A5A5A5] overflow-hidden">
                {/* Filter row */}
                <section className="grid grid-cols-12 items-center p-6 bg-[#F2F5FF] border-b border-[#D9D9D9]">
                    <div className="col-span-6 flex items-center space-x-4">
                        <span className="text-xl font-normal text-[#414141]">Question Type:</span>
                        <Select
                            value={filterType}
                            onValueChange={(value) => setFilterType(value as QuestionType | "ALL")}
                        >
                            <SelectTrigger className="w-[180px] text-lg text-black font-medium">
                                <SelectValue placeholder="All" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All</SelectItem>
                                <SelectItem value={QuestionType.MCQ}>Multiple Choice</SelectItem>
                                <SelectItem value={QuestionType.MSQ}>Select-All</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2 flex justify-center">
                        <span className="text-xl font-medium text-[#414141]">Date</span>
                    </div>
                    <div className="col-span-2 flex justify-center">
                        <span className="text-xl font-medium text-[#414141]">Avg. Score</span>
                    </div>
                    <div className="col-span-2"></div>
                </section>

                {/* Questions table */}
                <section className="divide-y divide-[#D9D9D9]">
                    {filteredQuestions.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No past questions found</div>
                    ) : (
                        filteredQuestions.map((question) => (
                            <div
                                key={question.id}
                                className="grid grid-cols-1 lg:grid-cols-12 gap-y-4 lg:gap-y-0 items-start lg:items-center p-6"
                            >
                                {/* Question column */}
                                <div className="lg:col-span-6">
                                    <span
                                        className="text-base lg:text-xl font-normal px-2 py-1 rounded border"
                                        style={{
                                            backgroundColor:
                                                questionTypeStyles[question.type].bgColor,
                                            color: questionTypeStyles[question.type].textColor,
                                            borderColor:
                                                questionTypeStyles[question.type].borderColor,
                                        }}
                                    >
                                        {questionTypeStyles[question.type].label}
                                    </span>
                                    <p className="mt-2 text-lg lg:text-2xl font-normal text-[#1F1F1F]">
                                        {question.text}
                                    </p>
                                </div>

                                {/* Date column */}
                                <div className="lg:col-span-2 flex lg:justify-center text-base lg:text-xl text-[#1F1F1F]">
                                    {formatDate(question.session.startTime)}
                                </div>

                                {/* Score column */}
                                <div className="lg:col-span-2 flex lg:justify-center text-base lg:text-xl font-semibold text-[#2D9B62]">
                                    {calculateScore(question)}%
                                </div>

                                {/* Student Answers column */}
                                <div className="lg:col-span-2 flex lg:justify-end">
                                    <Link
                                        href={`/dashboard/course/${courseId}/questionnaire/${question.id}/responses`}
                                        className="px-4 py-2 text-black rounded-lg border border-[#A5A5A5] text-center block"
                                    >
                                        Student Answers &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </div>
        </div>
    );
}

export default PastQuestions;
