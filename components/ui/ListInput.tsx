import React from "react";
import { X } from "lucide-react";

interface ListInputProps {
    id: string;
    index: number;
    removeItem: (index: number) => void;
    [key: string]: any;
}

export function ListInput({ id, index, removeItem, ...rest }: ListInputProps) {
    return (
        <div key={index} className="flex flex-row justify-center items-center gap-2">
            <textarea
                className={`h-11 w-64 md:w-80 px-5 bg-[hsl(var(--secondary))] text-black border border-slate-300 rounded-lg focus:outline-none pt-3 resize-none ${index === 0 ? "mr-4" : "mr-0"}`}
                {...rest}
            />
            {index > 0 && (
                <X
                    key={id}
                    onClick={() => removeItem(index)}
                    className="text-red-700 h-4 w-4 cursor-pointer"
                />
            )}
        </div>
    );
}

interface AddInputProps {
    onAdd: () => void;
    text: string;
}

export function AddInput({ onAdd, text }: AddInputProps) {
    return (
        <button
            onClick={onAdd}
            className="h-9 w-36 mt-2 bg-black text-white border border-slate-300 rounded-lg"
        >
            {text}
        </button>
    );
}
