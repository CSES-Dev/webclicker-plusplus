// app/addCourse/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"


export default function AddCoursePage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSubmit = () => {
    // Handle form submission logic
    console.log({
      name: name,
      code: code,
      days: selectedDays,
      color: selectedColor,
      times: {
        start: startTime,
        end: endTime,
      },
    });
    // check if code is already in use by calling a function in services.
    // if in use throw error otherwise create course component with name, code, date, time, color
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white flex flex-col justify-between">
      <h1 className="text-2xl font-bold mb-6">Add a Class</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-1">
          <input
            id="name"
            type="text"
            className="w-full p-0 bg-white text-black focus:outline-none focus:border-none"
            placeholder="Name of Class"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Separator className="mb-4"/>
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium mb-1">
            Class Code:
          </label>
          <input
            id="code"
            type="text"
            className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}          
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Days of the Week:</label>
          <div className="flex space-x-2">
            {["M", "T", "W", "Th", "F"].map((day) => (
              <button
                key={day}
                type="button"
                className={`w-11 h-11 rounded-full border border-[hsl(var(--input-border))] ${
                  selectedDays.includes(day)
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--secondary))]"
                    : "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"
                }`}
                onClick={() => handleDayToggle(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Assign Color:</label>
          <div className="flex space-x-2">
            {["#ED9D9D", "#F3AB7E", "#EEF583", "#94ED79", "#8E87F2"].map((color) => (
              <button
                key={color}
                type="button"
                className={`w-11 h-11 rounded-full ${
                  selectedColor === color ? "ring-2 ring-[hsl(var(--primary))]" : "border border -[hsl(var(--input-border))]"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Times:</label>
          <div className="flex space-x-6 items-center">
            <input
              type="time"
              className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
              placeholder=""
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <span className="text-center align-middle">to</span>
            <input
              type="time"
              className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
              placeholder=""
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <Button variant="addClass"
                size="addClass" 
                onClick={handleSubmit}
                className="mt-4 bottom-0 right-0"
                
        >
          Add Class
        </Button>
        {/* <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2 px-4 bg-[hsl(var(--secondary))] text-[hsl(var(--input-accent))] border border-[hsl(var(--input-accent))] rounded-md"
        >
          Add Class
        </button> */}
      </form>
    </div>
  );
}
