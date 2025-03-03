import React from "react";
import { X } from "lucide-react";

interface ListInputProps {
    id: string;
    index: number;
    value: string;
    removeItem: (index: number) => void;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ListInput({ id, index, value, removeItem, onChange }: ListInputProps) {
    return (
        <div key={index} className="w-full flex flex-row justify-center items-center gap-2">
            <textarea
                value={value}
                className={`h-11 w-full px-5 bg-[hsl(var(--secondary))] text-black border border-slate-300 rounded-lg focus:outline-none pt-3 `}
                onChange={onChange}
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
