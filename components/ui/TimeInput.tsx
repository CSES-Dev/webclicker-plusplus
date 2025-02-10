import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function TimeInput() {
    const [time, setTime] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9APMapm]/g, "").toUpperCase();
        let numbers = value.replace(/[^0-9]/g, "");
        let period = value.replace(/[^APM]/g, "");
        let formatted = "";

        if (numbers.length > 4) numbers = numbers.slice(0, 4);
        if (period.length > 1) period = period.slice(0, 1);

        let hours = numbers.slice(0, 2);
        let minutes = numbers.slice(2, 4);

        // Validate hours (01-12 only)
        if (hours.length === 2) {
            const hourNum = parseInt(hours, 10);
            if (hourNum < 1 || hourNum > 12) {
                hours = ""; // Reset if invalid
            }
        }

        // Validate minutes (00-59 only)
        if (minutes.length === 2) {
            const minuteNum = parseInt(minutes, 10);
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
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            setTime((prev) => {
                const stripped = prev.replace(/[^0-9APM]/g, "");
                return stripped.slice(0, -1);
            });
        }
    };

    return (
        <Input
            type="text"
            value={time}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border border-[hsl(var(--input-border))] rounded-md p-2"
        />
    );
}
