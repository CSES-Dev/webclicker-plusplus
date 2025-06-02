"use client";
import { shuffleArray } from "@/lib/utils";
import React, { useMemo } from "react";

interface Option {
    id: number;
    questionId: number;
    text: string;
    isCorrect: boolean;
}

interface AnswerOptionsProps {
    options: Option[];
    questionType: "MCQ" | "MSQ";
    selectedValues: number[] | number | null;
    onSelectionChange: (value: number | number[]) => void;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
    options,
    questionType,
    selectedValues,
    onSelectionChange,
}) => {
    const selectedOption = Array.isArray(selectedValues) ? null : selectedValues;
    const selectedOptions = Array.isArray(selectedValues) ? selectedValues : [];

    const shuffledOptions = useMemo(() => shuffleArray(options), [options]);

    const handleMCQSelection = (optionId: number) => {
        onSelectionChange(optionId);
    };

    const handleMSQSelection = (optionId: number) => {
        let newSelectedOptions: number[];

        if (selectedOptions.includes(optionId)) {
            newSelectedOptions = selectedOptions.filter((id) => id !== optionId);
        } else {
            newSelectedOptions = [...selectedOptions, optionId];
        }

        onSelectionChange(newSelectedOptions);
    };

    // MCQ rendering (full button highlight)
    // MCQ rendering (background highlight only)
    if (questionType === "MCQ") {
        return (
            <div className="w-full mt-6 flex flex-col items-center">
                <h2 className="text-[16px] font-medium mb-3 self-center">
                    Select the best answer:
                </h2>
                <div className="w-full max-w-md flex flex-col items-center gap-2">
                    {shuffledOptions.map((option) => {
                        const isSelected = selectedOption === option.id;
                        return (
                            <div
                                key={option.id}
                                className={`w-full max-w-[300px] rounded-lg overflow-hidden cursor-pointer ${
                                    isSelected
                                        ? " bg-custom-background text-white"
                                        : "bg-[hsl(var(--secondary))]"
                                }`}
                                onClick={() => handleMCQSelection(option.id)}
                            >
                                <div className="py-2 px-3">
                                    <div className="text-center">
                                        <span className="text-base text-[16px]">{option.text}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    // MSQ rendering with checkboxes
    return (
        <div className="w-full mt-6 flex flex-col items-center">
            <h2 className="text-[16px] font-medium mb-3 self-center">Select the best answer(s):</h2>
            <div className="w-full max-w-md flex flex-col items-center gap-2">
                {shuffledOptions.map((option) => {
                    const isSelected = selectedOptions.includes(option.id);
                    return (
                        <div
                            key={option.id}
                            className={
                                "w-full max-w-[300px] rounded-lg overflow-hidden cursor-pointer bg-[hsl(var(--secondary))]"
                            }
                            onClick={() => handleMSQSelection(option.id)}
                        >
                            <div className="py-2 px-3.5 flex items-center">
                                <div
                                    className={`w-[16px] h-[16px] flex items-center justify-center rounded-md ${
                                        isSelected
                                            ? "bg-custom-background border-custom-background"
                                            : "bg-white border border-gray-300"
                                    }`}
                                >
                                    {isSelected && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="10"
                                            height="10"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-grow text-center px-3">
                                    <span className="text-base">{option.text}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AnswerOptions;
