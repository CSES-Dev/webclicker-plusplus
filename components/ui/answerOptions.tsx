'use client';
import React from 'react';

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
    onSelectionChange 
}) => {
    const selectedOption = Array.isArray(selectedValues) ? null : selectedValues;
    const selectedOptions = Array.isArray(selectedValues) ? selectedValues : [];
    
    const handleMCQSelection = (optionId: number) => {
        onSelectionChange(optionId);
    };
    
    const handleMSQSelection = (optionId: number) => {
        let newSelectedOptions: number[];
        
        if (selectedOptions.includes(optionId)) {
            newSelectedOptions = selectedOptions.filter(id => id !== optionId);
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
                <h2 className="text-[16px] font-medium mb-3 self-center">Select the best answer:</h2>
                <div className="w-full max-w-md flex flex-col items-center gap-2">
                    {options.map((option) => {
                        const isSelected = selectedOption === option.id;
                        return (
                            <div
                                key={option.id}
                                className={`w-full max-w-[300px] rounded-lg overflow-hidden cursor-pointer ${
                                    isSelected ? ' bg-custom-background text-white' : 'bg-gray-50 hover:bg-gray-100'
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
                {options.map((option) => {
                    const isSelected = selectedOptions.includes(option.id);
                    return (
                        <div
                            key={option.id}
                            className={`w-full max-w-[300px] rounded-lg overflow-hidden cursor-pointer ${
                                isSelected ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => handleMSQSelection(option.id)}
                        >
                            <div className="py-2 px-3 flex items-center">
                                <div className={`min-w-7 w-7 h-7 flex items-center justify-center rounded-md ${
                                    isSelected 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'bg-white border border-gray-300'
                                }`}>
                                    {isSelected && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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