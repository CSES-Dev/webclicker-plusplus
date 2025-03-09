"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { signOut } from "next-auth/react";

export function AppSidebar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle dropdown menu

    const links = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Settings", href: "/dashboard/settings" },
    ];

    return (
        <>
            {/* Mobile View: Top Navigation Bar */}
            <div className="md:hidden w-full bg-blue-900 text-white flex items-center justify-between px-4 py-3">
                {/* Center-Aligned Text */}
                <div className="text-xl font-bold text-center flex-1">WebClicker++</div>

                {/* Hamburger Menu */}
                <button
                    className="text-2xl focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    ☰
                </button>
            </div>

            {/* Mobile View: Dropdown Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-blue-900 text-white w-full flex flex-col items-center py-4">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "text-lg py-2 px-4 w-full text-center hover:bg-blue-900 transition",
                                pathname === link.href ? "bg-blue-900 font-bold" : "font-normal",
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Button
                        variant="link"
                        className="text-white no-underline text-lg font-normal"
                        onClick={() => signOut()}
                    >
                        Logout
                    </Button>
                </div>
            )}

            {/* Desktop View: Sidebar */}
            <Sidebar className="hidden md:flex w-64 bg-blue-900 text-white h-screen flex-col justify-center items-center py-10">
                <SidebarContent className="flex flex-col justify-between">
                    {/* SVG Logo */}
                    <div className="flex flex-col items-center w-full">
                        <div className="flex items-center justify-center mb-12">
                            <img
                                src="/logo.svg"
                                alt="WebClicker++ Logo"
                                width={180}
                                height={65}
                                className="object-contain"
                            />
                        </div>

                        {/* Navigation Links */}
                        <SidebarMenu className="flex flex-col justify-center items-center w-full space-y-12">
                            {links.map((link) => (
                                <SidebarMenuItem
                                    key={link.name}
                                    className="w-full flex justify-center"
                                >
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname === link.href}
                                        className={cn(
                                            "text-2xl px-6 py-3 w-56 text-center flex justify-center items-center rounded-lg hover:bg-blue-900 transition",
                                            pathname === link.href
                                                ? "bg-blue-900 font-bold"
                                                : "font-normal",
                                        )}
                                    >
                                        <Link href={link.href} className="w-full text-center">
                                            {link.name}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                    <Button
                        variant="link"
                        className="text-white no-underline text-xl"
                        onClick={() => signOut()}
                    >
                        Logout
                    </Button>
                </SidebarContent>
            </Sidebar>
        </>
    );
}
