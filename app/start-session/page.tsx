"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"
import React, { useState } from 'react';

export default function startSession() {
    const [date, setDate] = useState("Month Day, Year");
    const [questionType, setQuestionType] = useState("Multiple Choice");
    const [question, setQuestion] = useState("Refer to slides.");
    const [choices, setChoices] = useState(["A", "B", "C", "D"]);
    const [questionNumber, setQuestionNumber] = useState(1);

    return (
        <div className="flex flex-col justify-between items-center">
            <div className="flex justify-between w-full">
                <Button>
                    &lt; Back
                </Button>
                <p>{date}</p>
            </div>

            <div className="flex flex-col justify-start w-3/4 border border-[hsl(var(--input-border))] rounded-md">
                <Badge className="max-w-max">{questionType}</Badge>
                <p>{question}</p>
            </div>

            <div className="flex flex-col justify-start w-3/4">
                <p>{choices[0]}</p>
                <p>{choices[1]}</p>
                <p>{choices[2]}</p>
                <p>{choices[3]}</p>
            </div>

            <div className="flex">
                <p>question progress</p>
            </div>

            <div className="flex justify-end w-3/4">
                <Button>
                    Next Question &gt;
                </Button>
            </div>
        </div>
    );
}