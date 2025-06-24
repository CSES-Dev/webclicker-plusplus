import { TooltipContent, StringTooltipContainer, Tooltip, TooltipTrigger } from "./ui/tooltip";

interface EllipsisYAxisTickProps {
    x?: number;
    y?: number;
    payload?: { value: string };
}

export function LetteredYAxisTick({ x = 0, y = 0, payload }: EllipsisYAxisTickProps) {
    if (!payload) return null;


    return (
        <g transform={`translate(${x},${y})`}>
            <foreignObject x={-42} y={-8} width={48} height={24}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="text-sm inline-block w-full truncate text-black">
                            {payload.value}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <StringTooltipContainer text={payload.value} />
                    </TooltipContent>
                </Tooltip>
            </foreignObject>
        </g>
    );
}
