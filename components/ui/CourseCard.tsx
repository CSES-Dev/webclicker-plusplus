import React from "react";

export type Props = {
    color: string;
    days: string[];
    title: string;
    timeStart: string;
    timeEnd: string;
};
export default function CourseCard({ color, days, title, timeStart, timeEnd }: Props) {
    return (
        <>
            {/* Mobile View */}
            <button className="md:hidden flex flex-col w-80 h-40 border border-black rounded-xl shadow-lg">
                <div
                    style={{ backgroundColor: color }}
                    className={`bg-[${color}] mt-4 h-4 w-full`}
                ></div>

                <div className="min-h-[60%] py-3 px-6 flex flex-col gap-2 items-start justify-start">
                    <p className={"text-xs"}>
                        Time: {timeStart} - {timeEnd}
                    </p>
                    <p className="text-xl text-left leading-tight">{title}</p>
                </div>
                <p className="px-6 text-xs text-[#585858]">{days.join(", ")}</p>
            </button>
            {/* Desktop View */}
            <button className="hidden md:block flex-col w-80 max-w-80 h-56 max-h-56 rounded-md shadow-lg">
                <div className={`bg-[${color}] min-h-[40%] max-h-[40%] w-full rounded-t-md`}></div>
                <div className="h-[40%] max-h-[40%] pt-3 px-6 flex flex-col gap-2 items-start justify-start">
                    <p className="text-xs text-[#434343]">
                        Time: {timeStart} - {timeEnd}
                    </p>
                    <p className="text-lg text-left leading-tight">{title}</p>
                </div>
                <p className="px-6 py-4 text-xs text-left text-[#434343]">{days.join(", ")}</p>
            </button>
        </>
    );
}
