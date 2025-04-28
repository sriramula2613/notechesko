
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex items-center h-14 px-4 border-b">
              <SidebarTrigger />
              <h1 className="ml-4 text-lg font-medium">TaskMate</h1>
            </div>
            <div className="flex-1">
              {children}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </motion.div>
  );
}
