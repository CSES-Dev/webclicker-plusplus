import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <div className="flex flex-col md:flex-row h-screen w-screen">
                {/* Sidebar */}
                <AppSidebar />
                {/* Main Content */}
                <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">{children}</main>
            </div>
        </SidebarProvider>
    );
}
