import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import localFont from "next/font/local";
import AuthGuard from "./auth";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";


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
            {/* <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <Providers>
                    <AuthGuard>{children}</AuthGuard>
                </Providers> */}
            <body
                className={`${figtree.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    // enableSystem
                    disableTransitionOnChange
                >
                    <Providers>
                        <AuthGuard>
                            <main>{children}</main>
                        </AuthGuard>
                    </Providers>
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
