import { MoreHorizontal } from "lucide-react";
import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EllipsisYAxisTickProps {
    x?: number;
    y?: number;
    payload?: { value: string };
}

export function LetteredYAxisTick({ x = 0, y = 0, payload }: EllipsisYAxisTickProps) {
    if (!payload) return null;

    const fullText = payload.value;
    const maxChars = 10;
    const truncated = fullText.length > maxChars ? fullText.slice(0, maxChars) : fullText;

    return (
        <g transform={`translate(${x},${y})`}>
            <text textAnchor="end" fill="#000" dy={4} dx={-2} fontSize={14} fontWeight={"Bold"}>
                {truncated}
            </text>
            {fullText.length > maxChars && (
                <foreignObject x={-10} y={-12} width={30} height={30}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                    }}
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div style={{ padding: "0.5rem 1rem", whiteSpace: "normal" }}>
                                    {fullText}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </foreignObject>
            )}
        </g>
    );
}
