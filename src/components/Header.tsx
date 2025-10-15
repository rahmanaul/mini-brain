import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "./ui/button";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
    const { isAuthenticated } = useConvexAuth();
    const { signOut } = useAuthActions();
    return (
      <>
        {isAuthenticated && (
          <Button
            variant="outline"
            onClick={() => void signOut()}
            className="ml-2"
          >
            Sign out
          </Button>
        )}
      </>
    );
  }

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mini Brain</h1>
          <SignOutButton />
        </div>
      </header>
  );
}