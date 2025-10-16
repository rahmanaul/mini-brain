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
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
                await signIn("password", formData);
              } catch (submissionError) {
                const message =
                  submissionError instanceof Error
                    ? submissionError.message
                    : "Something went wrong";
                setError(message);
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
                  {flow === "signIn" ? "Don’t have an account?" : "Already have an account?"}{" "}
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
                {error ? (
                  <FieldDescription className="text-center text-destructive">
                    {error}
                  </FieldDescription>
                ) : null}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
