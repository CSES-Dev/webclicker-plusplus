import React from "react";

export default function Name() {
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Content section with input fields */}
            <section className="flex justify-center pt-20">
                <div className="flex flex-col space-y-8 content-center justify-center gap-1">
                    <p className="text-center text-2xl">Enter your name:</p>
                    {/* First Name Input */}
                    <label className="outline outline-1 pl-8 pr-20 py-3 rounded-lg bg-white">
                        <input
                            className="text-black bg-white focus:outline-none"
                            placeholder="First Name"
                        />
                    </label>

                    {/* Last Name Input */}
                    <label className="outline outline-1 pl-8 pr-20 py-3 rounded-lg bg-white">
                        <input
                            className="text-black bg-white focus:outline-none"
                            placeholder="Last Name"
                        />
                    </label>

                    {/* Mobile-only continue button */}
                    <div className="block md:hidden lg:hidden text-center mt-8">
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
