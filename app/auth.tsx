"use client";

import { useSession } from "next-auth/react";
import { GlobalLoadingSpinner } from "@/components/ui/global-loading-spinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();

    if (status === "loading") return <GlobalLoadingSpinner />;

    // If we have a session, render the children
    return <>{children}</>;
}
