"use client";
import React from "react";

interface QuestionCardProps {
    question: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
    return (
        <div className="w-full flex justify-center">
            <div className="border rounded-lg overflow-hidden w-full max-w-[330px]">
                <div className="bg-[hsl(var(--secondary))] py-3 px-4 border-b">
                    <h3 className="text-[20px] font-medium text-center">Question:</h3>
                </div>
                <div className="bg-white py-6 px-4">
                    <p className="text-base text-center text-[16px]">{question}</p>
                </div>
            </div>
        </div>
    );
};

export default QuestionCard;
