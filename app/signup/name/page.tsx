"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { z } from "zod";

// Define a Zod schema for validating names.
const nameSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required")
        .regex(
            /^[A-Za-z\s'-]+$/,
            "First name can only contain letters, spaces, apostrophes, or hyphens",
        ),
    lastName: z
        .string()
        .min(1, "Last name is required")
        .regex(
            /^[A-Za-z\s'-]+$/,
            "Last name can only contain letters, spaces, apostrophes, or hyphens",
        ),
});

// expected API response from GET
interface UserNameResponse {
    firstName?: string;
    lastName?: string;
}

interface APIErrorResponse {
    error?: string;
}

export default function Name() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingName, setLoadingName] = useState(true);

    // Fetch the current name from the controller when the component mounts.
    useEffect(() => {
        async function fetchUserName(): Promise<void> {
            try {
                const res = await fetch("/api/updateUserNameController", {
                    method: "GET",
                });
                if (!res.ok) {
                    throw new Error("Failed to fetch user name");
                }
                const data = (await res.json()) as UserNameResponse;
                setFirstName(data.firstName ?? "");
                setLastName(data.lastName ?? "");
            } catch (err: unknown) {
                console.error("Error fetching user name:", err);
            } finally {
                setLoadingName(false);
            }
        }
        void fetchUserName();
    }, []);

    // Validate the inputs with Zod and submit the update via the API.
    const handleContinue = async (): Promise<void> => {
        setError(null);
        const result = nameSchema.safeParse({ firstName, lastName });
        if (!result.success) {
            // const errorMessages = Object.values(result.error.flatten().fieldErrors)
            //     .flat()
            //     .join(", ");
            setError("Please enter only letters!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/updateUserNameController", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName }),
            });
            if (!response.ok) {
                const data = (await response.json()) as APIErrorResponse;
                throw new Error(data.error ?? "Failed to update name");
            }
            router.push("/signup/finish");
        } catch (err: unknown) {
            console.error("Error updating name:", err);
            setError("An unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleContinueClick = () => {
        void handleContinue();
    };

    if (loadingName) {
        return <div>...</div>;
    }
    return (
        <main className="min-h-screen bg-gray-50">
            {/* Content section with input fields */}
            <section className="flex justify-center pt-20">
                <div className="flex flex-col space-y-8 content-center justify-center gap-1">
                    <p className="text-center text-2xl">Enter your name:</p>
                    {/* First Name Input */}
                    <label className="outline outline-1 pl-8 pr-20 py-3 rounded-lg bg-white">
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                            }}
                            className="text-black bg-white focus:outline-none"
                            placeholder="First Name"
                        />
                    </label>
                    {/* Last Name Input */}
                    <label className="outline outline-1 pl-8 pr-20 py-3 rounded-lg bg-white">
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => {
                                setLastName(e.target.value);
                            }}
                            className="text-black bg-white focus:outline-none"
                            placeholder="Last Name"
                        />
                    </label>
                    {error && <p className="text-red-500 text-center max-w-xs mx-auto">{error}</p>}
                    {/* Mobile-only continue button */}
                    <div className="block md:hidden lg:hidden text-center mt-8">
                        <button
                            onClick={handleContinueClick}
                            disabled={loading}
                            className="px-10 py-2 rounded-lg text-lg bg-[#18328D] text-white hover:bg-[#18328D] transition-all"
                        >
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
                    width={112} // 28 * 4 = 112px
                    height={112}
                    className="w-28 h-28"
                    priority
                />
                <button
                    onClick={handleContinueClick}
                    disabled={loading}
                    className="px-10 py-2 rounded-lg text-lg bg-[#18328D] text-white hover:bg-[#18328D] transition-all"
                >
                    Continue
                </button>
            </div>
        </main>
    );
}
