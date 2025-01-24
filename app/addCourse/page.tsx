// app/addCourse/page.tsx
"use client";

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
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name of Class
          </label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded-md bg-white text-black"
            placeholder="Enter class name"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="code" className="block text-sm font-medium mb-1">
            Class Code:
          </label>
          <input
            id="code"
            type="text"
            className="w-full p-2 border rounded-md bg-white text-black"
            placeholder="Enter class code"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Days of the Week:</label>
          <div className="flex space-x-2">
            {["M", "T", "W", "Th", "F"].map((day) => (
              <button
                key={day}
                type="button"
                className={`px-4 py-2 rounded-md border ${
                  selectedDays.includes(day)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-black"
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
            {["#f28b82", "#fbbc04", "#ccff90", "#a7ffeb", "#d7aefb"].map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border ${
                  selectedColor === color ? "ring-2 ring-blue-500" : ""
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
              className="w-full p-2 border rounded-md bg-white text-black"
              placeholder="Start Time"
            />
            <span className="text-center align-middle">to</span>
            <input
              type="time"
              className="w-full p-2 border rounded-md bg-white text-black"
              placeholder="End Time"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md font-semibold"
        >
          Add Class
        </button>
      </form>
    </div>
  );
}
