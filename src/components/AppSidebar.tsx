
import { NavLink } from "react-router-dom";
import { Calendar, ChartBar, List } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const navigationItems = [
    {
      title: "Tasks",
      icon: List,
      path: "/dashboard",
    },
    {
      title: "Calendar",
      icon: Calendar,
      path: "/calendar",
    },
    {
      title: "Analytics",
      icon: ChartBar,
      path: "/analytics",
    },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center px-2 py-3">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary/80">
            TaskMate
          </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => 
                        cn("flex items-center", isActive && "data-[active=true]")
                      }
                      end
                    >
                      <item.icon className="mr-2" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-3 py-2 text-xs text-muted-foreground">
          TaskMate © 2025
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
