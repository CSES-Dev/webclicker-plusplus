"use client";

import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";
import { useSession } from "next-auth/react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();

    if (status === "loading") return <GlobalLoadingSpinner />;

    // If we have a session, render the children
    return <>{children}</>;
}
