"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppSidebar() {
    const pathname = usePathname();

    const links = [
        { name: "Dashboard", href: "/" },
        { name: "Questionnaire", href: "/questionnaire" },
        { name: "Calendar", href: "/calendar" },
        { name: "Settings", href: "/settings" },
    ];

    return (
        <Sidebar className="w-64 bg-blue-900 text-white h-screen flex flex-col justify-center items-center py-10">
            <SidebarContent className="flex flex-col items-center w-full">
                {/* Logo (Replaces Text) */}
                <div className="flex items-center justify-center mb-12">
                    {" "}
                    {/* Increased margin */}
                    <Image
                        src="/logo.svg"
                        alt="WebClicker++ Logo"
                        width={180}
                        height={65}
                        priority
                    />
                </div>

                {/* Navigation Links - Center Aligned, Bigger, More Spaced */}
                <SidebarMenu className="flex flex-col justify-center items-center w-full space-y-12">
                    {links.map((link) => (
                        <SidebarMenuItem key={link.name} className="w-full flex justify-center">
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === link.href}
                                className={cn(
                                    "text-2xl px-6 y-3 w-56 text-center flex justify-center items-center rounded-lg hover:bg-blue-700 transition",
                                    pathname === link.href
                                        ? "bg-blue-800 font-bold"
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
            </SidebarContent>
        </Sidebar>
    );
}
