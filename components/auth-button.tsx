"use client";
import Image from "next/image";
import { signIn, useSession } from "next-auth/react";

export default function AuthButton() {
    const { data: session } = useSession();

    return (
        <button
            onClick={() => signIn("google")}
            className="flex items-center bg-custom-blue-button dark:bg-gray-900 border border-gray-300 rounded-lg shadow-md px-9 py-3 text-sm font-medium text-white dark:text-white hover:bg-slate-400 focus:outline-none active:bg-slate-500"
        >
            <Image
                src="/googlebutton.svg"
                alt="Google Logo"
                width={20} // 5 * 4 = 20px
                height={20}
                className="w-5 h-5"
            />
            <span className="ml-3 text-white">Sign in with Google</span>
        </button>
    );
}
