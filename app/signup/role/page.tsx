import React from "react";
import Image from "next/image"

export default function Name() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Content section */}
            <section className="flex justify-center pt-20">
                <div className="flex flex-col space-y-8 content-center justify-center gap-1">
                    {/* Heading */}
                    <p className="text-center text-2xl">
                        Select the role that bests describes you:
                    </p>
                    {/* Role selection buttons */}
                    <button className="outline outline-1 px-10 py-2 rounded-lg text-lg text-[#0029BD] outline-[#0029BD] hover:bg-[#0029BD] hover:text-white transition-all">
                        Student
                    </button>
                    <button className="outline outline-1 px-10 py-2 rounded-lg text-lg text-[#0029BD] outline-[#0029BD] hover:bg-[#0029BD] hover:text-white transition-all">
                        Teacher
                    </button>
                    <div className="block md:hidden lg:hidden text-center mt-8">
                        {/* Button for mobile (below inputs) */}
                        <button className="px-10 py-2 rounded-lg text-lg bg-[#18328D] text-white hover:bg-[#18328D] transition-all">
                            Continue
                        </button>
                    </div>
                </div>
            </section>
            {/* Desktop/tablet layout with logo and continue button */}
            <div className="hidden md:flex left-72 right-72 bottom-44 items-center justify-around p-6">
                <img src="/webclickericon.svg" alt="logo" className="w-28 h-28" />
                <button className="px-10 py-2 rounded-lg text-lg bg-[#18328D] text-white hover:bg-[#18328D] transition-all">
                    Continue
                </button>
            </div>
        </main>
    );
}
