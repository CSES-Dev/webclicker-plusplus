// app/addCourse/page.tsx

"use client";

import { Separator } from "@/components/ui/separator"
import { useState } from "react";

export default function AddCoursePage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

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
      name: "",
      code: "",
      days: selectedDays,
      color: selectedColor,
      times: {
        start: "",
        end: "",
      },
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-6">Add a Class</h1>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4">
          {/* <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name of Class
          </label> */}
          <input
            id="name"
            type="text"
            className="w-full p-2 bg-white text-black"
            placeholder="Name of Class"
          />
        </div>
        <Separator className="my-4" />
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium mb-1">
            Class Code:
          </label>
          <input
            id="code"
            type="text"
            className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
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
                  selectedColor === color ? "ring-2 ring-[hsl(var(--primary))]" : ""
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Times:</label>
          <div className="flex space-x-2">
            <input
              type="time"
              className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
              placeholder="Start Time"
            />
            <span className="text-center align-middle">to</span>
            <input
              type="time"
              className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
              placeholder="End Time"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2 px-4 bg-[hsl(var(--secondary))] text-white rounded-md font-semibold"
        >
          Add Class
        </button>
      </form>
    </div>
  );
}
