import type { Metadata } from "next";
import { Figtree } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
            <body className={`${figtree.className} antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    // enableSystem
                    disableTransitionOnChange
                >
                    <main>{children}</main>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
