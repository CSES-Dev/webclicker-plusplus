import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface Props {
    currentDate: Date;
    onSelect: (date: Date) => void;
}

export function DatePicker({ currentDate, onSelect }: Props) {
    return (
        <Popover modal={true}>
            <PopoverTrigger className="h-11 w-full bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))] text-black border border-slate-300 flex justify-between items-center font-normal shadow-none rounded-lg">
                <p className="ml-3">{currentDate && format(currentDate, "PPP")}</p>
                <CalendarIcon className="mx-3 h-4 w-4 float-end" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date: Date | undefined) => {
                        if (date) {
                            onSelect(date);
                        }
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
