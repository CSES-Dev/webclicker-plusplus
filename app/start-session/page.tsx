"use client";
import { Button } from "@/components/ui/button";
import React from 'react';

export default function startSession() {
    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-between w-full">
                <Button>
                    &lt; Back
                </Button>
                <p>date</p>
            </div>

            <div className="flex flex-col items-left w-3/4 border border-[hsl(var(--input-border))] rounded-md">
                <p>question type</p>
                <p>question</p>
            </div>

            <div>
                <p>answer progress</p>
            </div>

            <div>
                <p>question progress</p>
            </div>

            <div>
                <p>next question</p>
            </div>

        </div>
    );
};