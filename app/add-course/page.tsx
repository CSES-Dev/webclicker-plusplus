// app/addCourse/page.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { addCourse, getAllCourses } from "@/services/course";
import { colorOptions, daysOptions } from "@/lib/constants";
import TimeInput from '@/components/ui/TimeInput';
import {Input} from '@/components/ui/input';
// import { TimePickerInput } from "@/components/time-picker/time-picker-input";
// import { TimePeriodSelect } from "@/components/time-picker/period-select";
// import { Period } from "@/components/time-picker/time-picker-utils";

export default function AddCoursePage() {
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [isFormValid, setIsFormValid] = useState(false);

    const handleDayToggle = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
        );
    };

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
    };

    const handleSubmit = async () => {
        if (!isFormValid) return;
        // Assuming the form values are set in state variables like `name`, `code`, etc.
        const result = await addCourse(name, code, selectedDays, selectedColor, startTime, endTime);

        if ("error" in result) {
            console.log(result.error); // Handle error
        } else {
            console.log(`Course created: ${result.title}`); // Handle success
        }

        //testing purposes
        const result2 = await getAllCourses();

        if ("error" in result2) {
            console.log(result2.error); // Logs the error in the server console
        } else {
            console.log(result2); // Logs the course data in the server console
        }
    };

    const handleSubmitButton = () => {
      void handleSubmit();
    };

    useEffect(() => {
        const isValid =
            name.trim() !== "" &&
            code.trim() !== "" &&
            selectedDays.length > 0 &&
            selectedColor !== null &&
            startTime.trim() !== "" &&
            endTime.trim() !== "";

        setIsFormValid(isValid);
    }, [name, code, selectedDays, selectedColor, startTime, endTime]);

    return (
        <div className="p-8 pr-12 max-w-md mx-auto bg-white flex flex-col justify-between">
            <h1 className="text-2xl font-bold mb-6">Add a Class</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                }}
            >
                <div className="mb-1">
                    <input
                        id="name"
                        type="text"
                        className="w-full p-0 bg-white text-black focus:outline-none focus:border-none"
                        placeholder="Name of Class"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                        }}
                    />
                </div>
                <Separator className="mb-4" />
                <div className="mb-4">
                    <label htmlFor="code" className="block text-sm font-medium mb-2">
                        Class Code:
                    </label>
                    <input
                        id="code"
                        type="text"
                        className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value);
                        }}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Days of the Week:</label>
                    <div className="flex gap-3">
                        {daysOptions.map((day) => (
                            <button
                                key={day}
                                type="button"
                                className={`w-11 h-11 rounded-full border border-[hsl(var(--input-border))] ${
                                    selectedDays.includes(day)
                                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--secondary))]"
                                        : "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                                }`}
                                onClick={() => {
                                    handleDayToggle(day);
                                }}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Assign Color:</label>
                    <div className="flex gap-3">
                        {colorOptions.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={`w-11 h-11 rounded-full ${
                                    selectedColor === color
                                        ? "ring-2 ring-[hsl(var(--primary))]"
                                        : "border border -[hsl(var(--input-border))]"
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() => { handleColorSelect(color); }}
                            />
                        ))}
                    </div>
                </div>
                <div className="mb-16">
                    <label className="block text-sm font-medium mb-2">Times:</label>
                    <div className="flex justify-between items-center">
                        <input
                            type="time"
                            className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
                            placeholder=""
                            value={startTime}
                            onChange={(e) => {
                                setStartTime(e.target.value);
                            }}
                        />
                        <span className="text-center align-middle">to</span>
                        <input
                            type="time"
                            className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
                            placeholder=""
                            value={endTime}
                            onChange={(e) => {
                                setEndTime(e.target.value);
                            }}
                        />
                    </div>
                </div>
                <div className="pb-8 flex justify-end">
                    <Button
                        variant={isFormValid ? "primary" : "disabled"}
                        size="primary"
                        onClick={handleSubmitButton}
                        className="mt-4"
                    >
                        Add Class
                    </Button>
                </div>
            </form>
        </div>
    );
}
