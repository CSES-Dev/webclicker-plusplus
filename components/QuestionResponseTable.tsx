import React from "react";

type Question = {
    id: number;
    text: string;
    type: "MCQ" | "MSQ";
    inputtedAnswers: number[];
    correctAnswers: number[];
    options: { id: number; text: string }[];
};

interface Props {
    questions: Question[];
}

export const QuestionResponseTable: React.FC<Props> = ({ questions }) => {
    return (
        <div className="space-y-2 max-h-72 overflow-y-auto">
            {questions.map((question, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col border rounded-md py-10 relative">
                        <div className="text-lg text-center px-2">{question.text}</div>
                        <div className="absolute bottom-2 right-2">
                            <span className="text-xs bg-[#EDEDED] rounded text-[#5C0505] px-2 py-1">
                                {question.type === "MCQ" ? "Multiple Choice" : "Multi-Select"}
                            </span>
                        </div>
                    </div>
                    <div className="border rounded-md text-lg flex items-center justify-center text-center">
                        {question.inputtedAnswers
                            .map((optId) => question.options.find((o) => o.id === optId)?.text)
                            .join(", ") || "—"}
                    </div>
                    <div className="border rounded-md text-lg flex items-center justify-center text-center">
                        {question.correctAnswers
                            .map((optId) => question.options.find((o) => o.id === optId)?.text)
                            .join(", ")}
                    </div>
                </div>
            ))}
        </div>
    );
};
