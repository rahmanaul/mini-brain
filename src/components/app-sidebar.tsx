import * as React from "react"
import { Brain } from "lucide-react"
import { Link, useRouterState } from "@tanstack/react-router"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Home",
    to: "/",
  },
  {
    title: "Notes",
    to: "/notes",
  },
  {
    title: "Questions",
    to: "/questions",
  },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isActive = React.useCallback(
    (to: string) => {
      if (to === "/") {
        return pathname === "/"
      }

      return pathname === to || pathname.startsWith(`${to}/`)
    },
    [pathname]
  )

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild isActive={isActive("/")}>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Brain className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Mini Brain</span>
                  <span className="text-xs text-muted-foreground">Knowledge assistant</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={isActive(item.to)}>
                  <Link to={item.to}>{item.title}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
