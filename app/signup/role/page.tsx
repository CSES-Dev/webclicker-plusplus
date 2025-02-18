'use client'

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Name() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const savedRole = localStorage.getItem("userRole");
        if (savedRole) {
            setSelectedRole(savedRole);
        }
    }, []);


    const handleRoleSelect = (role: string) =>{
        setSelectedRole(role)
    }

    const handleBack = () =>{
        router.push('/signup/name')
    }

    const handleContinue = () => {
        if (selectedRole) {
            localStorage.setItem('userRole', selectedRole);
            router.push('finish')         
        }
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Content section */}
            <button
                onClick={handleBack}
                className="absolute top-8 left-8 flex items-center gap-2  outline outline-1 text-white bg-custom-background hover:bg-white hover:text-[#0029BD] outline-[#0029BD] transition-all p-2 rounded-lg px-4"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-lg">Back</span>
            </button>
            <section className="flex justify-center pt-20">
                <div className="flex flex-col space-y-8 content-center justify-center gap-1">
                    {/* Heading */}
                    <p className="text-center text-2xl">
                        Select the role that bests describes you:
                    </p>
                    {/* Role selection buttons */}
                    <button onClick={() => handleRoleSelect('student')}  className="outline outline-1 px-10 py-2 rounded-lg text-lg text-[#0029BD] outline-[#0029BD] hover:bg-[#0029BD] hover:text-white transition-all focus:bg-[#0029BD] focus:text-white">
                        Student
                    </button>
                    <button onClick={() => handleRoleSelect('lecturer')} className="outline outline-1 px-10 py-2 rounded-lg text-lg text-[#0029BD] outline-[#0029BD] hover:bg-[#0029BD] hover:text-white  focus:bg-[#0029BD] focus:text-white transition-all">
                        Lecturer
                    </button>
                    <div className="block md:hidden lg:hidden text-center mt-8">
                        {/* Button for mobile (below inputs) */}
                        <button onClick={handleContinue} className="px-10 py-2 rounded-lg text-lg bg-[#18328D] text-white hover:bg-[#18328D] transition-all">
                            Continue
                        </button>
                    </div>
                </div>
            </section>
            {/* Desktop/tablet layout with logo and continue button */}
            <div className="hidden md:flex left-72 right-72 bottom-44 items-center justify-around p-6">
                <Image
                    src="/webclickericon.svg"
                    alt="logo"
                    width={112}
                    height={112}
                    className="w-28 h-28"
                    priority
                />
                <button onClick={handleContinue} className="px-10 py-2 rounded-lg text-lg bg-[#18328D] text-white hover:bg-[#18328D] transition-all">
                    Continue
                </button>
            </div>
        </main>
    );
}
