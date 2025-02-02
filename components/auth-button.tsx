"use client";
import { signIn, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center bg-blue-950 dark:bg-gray-900 border border-gray-300 rounded-lg shadow-md px-9 py-3 text-sm font-medium text-white dark:text-white hover:bg-slate-400 focus:outline-none active:bg-slate-500"
    >
      <img src="/googlebutton.svg" className="w-5 h-5" alt="Google Logo" />
      <span className="ml-3 text-white">Sign in with Google</span>
    </button>
  );
}
