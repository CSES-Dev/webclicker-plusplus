"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils"; // Utility for conditional classNames

export function Sidebar() {
    const pathname = usePathname(); // Get current route

    const links = [
        { name: "Dashboard", href: "/" },
        { name: "Questionnaire", href: "/questionnaire" },
        { name: "Calendar", href: "/calendar" }, // Link to Calendar Page
        { name: "Settings", href: "/settings" },
    ];

    return (
        <aside className="w-64 h-screen bg-blue-900 text-white flex flex-col p-6">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
                <span className="text-2xl font-bold">Webclicker++</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-6">
                {links.map((link) => (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                            "text-lg hover:underline transition",
                            pathname === link.href ? "font-bold underline" : "",
                        )}
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
