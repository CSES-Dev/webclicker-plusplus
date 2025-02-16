"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function AuthButton() {
    const handleSignIn = async () => {
        try {
            await signIn("google", {
                callbackUrl: '/signup/name', // Middleware will handle redirecting from here
            });
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    return (
        <button
            onClick={handleSignIn}
            className="flex items-center bg-custom-blue-button dark:bg-gray-900 border border-gray-300 rounded-lg shadow-md px-9 py-3 text-sm font-medium text-white dark:text-white hover:bg-slate-400 focus:outline-none active:bg-slate-500"
        >
            <Image
                src="/googlebutton.svg"
                alt="Google Logo"
                width={20}
                height={20}
                className="w-5 h-5"
            />
            <span className="ml-3 text-white">Sign in with Google</span>
        </button>
    );
}