"use client";

import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useConvexAuth } from "convex/react";

import { SignOutButton } from "@/components/Header";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LoginForm } from "@/components/login-form";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";

function RootLayout() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  // Public routes that don't require authentication
  const publicRoutes = ['/reset-password', '/verify-otp'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Allow public routes to render without authentication
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <ThemeProvider>
        <div className="flex min-h-svh items-center justify-center bg-background px-4">
          <LoginForm className="w-full max-w-md" />
        </div>
      </ThemeProvider>
    );
  }

  // For public routes, render a simple layout without sidebar
  if (!isAuthenticated && isPublicRoute) {
    return (
      <ThemeProvider>
        <div className="min-h-svh bg-background">
          <Outlet />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex min-h-svh w-full">
          <AppSidebar />
          <SidebarInset>
            <div className="flex min-h-svh flex-col">
              <header className="border-b bg-background sticky top-0 z-10">
                <div className="flex h-14 items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                    Mini Brain
                  </h1>
                  <div className="ml-auto flex items-center">
                    <ThemeToggle />
                    <SignOutButton />
                  </div>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto">
                <Outlet />
              </div>
              {import.meta.env.DEV ? <TanStackRouterDevtools /> : null}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
