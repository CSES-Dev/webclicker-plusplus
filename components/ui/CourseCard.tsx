import { Role } from "@prisma/client";
import React from "react";
import { useRouter } from "next/navigation";

export type Props = {
    color: string;
    days: string[];
    title: string;
    timeStart: string;
    timeEnd: string;
    code: string;
    role: Role;
    id: number;
};

export default function CourseCard({
    color,
    days,
    title,
    timeStart,
    timeEnd,
    code,
    role,
    id,
}: Props) {
    const router = useRouter();

    const handleCardClick = () => {
        if (role === "LECTURER") {
            router.push(`/questionnaire?courseId=${id}`);
        } else if (role === "STUDENT") {
            router.push(`/course/${id}/live-poll`);
        }
    };

    return (
        <>
            {/* Mobile View */}
            <button
                onClick={handleCardClick}
                className="md:hidden flex flex-col w-80 h-40 border border-black rounded-xl shadow-lg"
            >
                <div style={{ backgroundColor: color }} className={`mt-4 h-4 w-full`}></div>
                <div className="min-h-[60%] py-3 px-6 flex flex-col gap-2 items-start justify-start">
                    <p className={"text-xs text-[#18328D]"}>
                        Time: {timeStart} - {timeEnd}
                    </p>
                    <p className="text-xl text-left leading-tight">{title}</p>
                </div>
                <p className="px-6 text-xs text-[#585858]">{days.join(", ")}</p>
            </button>
            {/* Desktop View */}
            <button
                onClick={handleCardClick}
                className="hidden md:block flex-col w-80 max-w-80 h-56 max-h-56 rounded-md shadow-lg"
            >
                <div
                    className={`min-h-[40%] max-h-[40%] w-full rounded-t-md`}
                    style={{ backgroundColor: color }}
                ></div>
                <div className="h-[40%] max-h-[40%] pt-3 px-6 flex flex-col gap-2 items-start justify-start">
                    <p className="text-xs text-[#434343]">
                        Time: {timeStart} - {timeEnd}
                    </p>
                    <p className="text-lg text-left leading-tight">{title}</p>
                    <span className="inline-flex gap-4">
                        <p className="text-sm">
                            Code:{" "}
                            <em>
                                {(+code).toLocaleString("en-US", {
                                    minimumIntegerDigits: 6,
                                    useGrouping: false,
                                })}
                            </em>
                        </p>
                        <p className="text-sm capitalize">
                            Role: <em>{role.toLocaleLowerCase()}</em>
                        </p>
                    </span>
                </div>
                <p className="px-6 py-3 text-xs text-left text-[#434343]">{days.join(", ")}</p>
            </button>
        </>
    );
}
