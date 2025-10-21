"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  const { signIn } = useAuthActions();


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {flow === "signIn" ? "Login to your account" : "Create an account"}
          </CardTitle>
          <CardDescription>
            {flow === "signIn"
              ? "Enter your credentials to access Mini Brain"
              : "Sign up with your email to start using Mini Brain"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setIsSubmitting(true);
              const form = event.currentTarget;
              const formData = new FormData(form);
              formData.set("flow", flow);

              try {
                if (flow === "signUp") {
                  // For signup, use normal Convex Auth flow
                  await signIn("password", formData);
                  
                  // If we get here, signup was successful
                  // Redirect to OTP verification page
                  window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
                } else {
                  // For sign in, use normal Convex Auth flow
                  await signIn("password", formData);
                }
              } catch (submissionError) {
                const message =
                  submissionError instanceof Error
                    ? submissionError.message
                    : "Something went wrong";
                
                // Check if this is a signup that requires email verification
                if (flow === "signUp" && message.includes("check your email")) {
                  // Redirect to OTP verification page
                  window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
                } else {
                  setError(message);
                }
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={flow === "signIn" ? "current-password" : "new-password"}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Submitting..."
                    : flow === "signIn"
                      ? "Sign in"
                      : "Sign up"}
                </Button>
                <FieldDescription className="text-center">
                  {flow === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:no-underline"
                    onClick={() =>
                      setFlow((previous) =>
                        previous === "signIn" ? "signUp" : "signIn"
                      )
                    }
                    disabled={isSubmitting}
                  >
                    {flow === "signIn" ? "Sign up" : "Sign in"}
                  </button>
                </FieldDescription>
                {flow === "signIn" && (
                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:no-underline"
                      onClick={() => window.location.href = "/reset-password"}
                      disabled={isSubmitting}
                    >
                      Forgot your password?
                    </button>
                  </FieldDescription>
                )}
                {error ? (
                  <div className="text-center">
                    <FieldDescription className="text-destructive mb-2">
                      {error}
                    </FieldDescription>
                  </div>
                ) : null}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
