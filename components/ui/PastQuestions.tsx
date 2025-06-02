import React, { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Question, QuestionType } from "@prisma/client";
import { questionTypeMap } from "@/lib/constants";
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
    }[];
}

interface Props {
    courseId: number;
}

function PastQuestions({ courseId }: Props) {
    const [questions, setQuestions] = useState<PastQuestion[]>([]);
    const [loading, setLoading] = useState(true);
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
            } finally {
                setLoading(false);
            }
        };

        fetchPastQuestions();
    }, [courseId]);

    const filteredQuestions = questions.filter(
        (question) => filterType === "ALL" || question.type === filterType,
    );

    const calculateScore = (question: PastQuestion) => {
        if (question.responses.length === 0) return 0;

        const correctResponses = question.responses.filter((response) => {
            const option = question.options.find((opt) => opt.id === response.optionId);
            return option?.isCorrect;
        });

        return Math.round((correctResponses.length / question.responses.length) * 100);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US");
    };

    if (loading) {
        return <div className="flex justify-center py-8">Loading past questions...</div>;
    }

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
                            <div key={question.id} className="grid grid-cols-12 items-center p-6">
                                {/* Question column */}
                                <div className="col-span-6">
                                    <span
                                        className="text-xl font-normal px-2 py-1 rounded border"
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
                                    <p className="mt-2 text-2xl font-normal text-[#1F1F1F]">
                                        {question.text}
                                    </p>
                                </div>

                                {/* Date column */}
                                <div className="col-span-2 flex justify-center">
                                    <span className="text-xl font-normal text-[#1F1F1F]">
                                        {formatDate(question.session.startTime)}
                                    </span>
                                </div>

                                {/* Score column */}
                                <div className="col-span-2 flex justify-center">
                                    <span className="text-xl font-semibold text-[#2D9B62]">
                                        {calculateScore(question)}%
                                    </span>
                                </div>

                                {/* Student Answers column */}
                                <div className="col-span-2 flex justify-end">
                                    <Link
                                        href={`/dashboard/course/${courseId}/questionnaire/${question.id}/responses`}
                                        className="px-4 py-2 text-black rounded-md border border-[#A5A5A5]"
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
