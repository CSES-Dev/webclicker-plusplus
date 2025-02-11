import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function TimeInput({
  value = "",
  onChange,
  placeholder = "",
  className = "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
}: TimeInputProps) {
  const [time, setTime] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9APMapm]/g, "").toUpperCase();
    let numbers = newValue.replace(/[^0-9]/g, "");
    let period = newValue.replace(/[^APM]/g, "");
    let formatted = "";

    if (numbers.length > 4) numbers = numbers.slice(0, 4);
    if (period.length > 1) period = period.slice(0, 1);

    let hours = numbers.slice(0, 2);
    let minutes = numbers.slice(2, 4);

    // Restrict first digit of hours to 0 or 1 only
    if (hours.length > 0 && !/[01]/.test(hours[0])) {
      hours = "";
    }

    // Validate hours (01-12 only)
    if (hours.length === 2) {
      let hourNum = parseInt(hours, 10);
      if (hourNum < 1 || hourNum > 12) {
        hours = ""; // Reset if invalid
      }
    }
    
    // Restrict first digit of minutes to 0-5 only
    if (minutes.length > 0 && /[6-9]/.test(minutes[0])) {
      minutes = "";
    }
    
    // Validate minutes (00-59 only)
    if (minutes.length === 2) {
      let minuteNum = parseInt(minutes, 10);
      if (minuteNum < 0 || minuteNum > 59) {
        minutes = ""; // Reset if invalid
      }
    }
    
    minutes = minutes.padEnd(2, "_");
    
    // Ensure period is correctly formatted
    if (period.length === 1) {
      period = period === "A" ? "AM" : "PM";
    }

    formatted = `${hours.padEnd(2, "_")}:${minutes}${period ? " " + period : ""}`;
    setTime(formatted);
    if (onChange) onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      setTime((prev) => {
        let stripped = prev.replace(/[^0-9APM]/g, "");
        let newTime = stripped.slice(0, -1);
        if (onChange) onChange(newTime);
        return newTime;
      });
    }
  };

  return (
    <Input
      type="text"
      value={time}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`text-center ${className}`}
    />
  );
}