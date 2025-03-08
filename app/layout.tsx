import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";

import AuthGuard from "./auth";
import "./globals.css";
import { Providers } from "./providers";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});
const figtree = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "WebClicker++",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${figtree.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
                    <Providers>
                        <AuthGuard>
                            <SidebarProvider>
                                {/* Adjusted Layout */}
                                <div className="flex flex-col md:flex-row h-screen w-screen">
                                    {/* Sidebar */}
                                    <AppSidebar />
                                    {/* Main Content */}
                                    <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                                        {children}
                                    </main>
                                </div>
                            </SidebarProvider>
                        </AuthGuard>
                    </Providers>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}