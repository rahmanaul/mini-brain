import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { SignOutButton } from "@/components/Header";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

function RootLayout() {
  return (
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
                <div className="ml-auto">
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
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
