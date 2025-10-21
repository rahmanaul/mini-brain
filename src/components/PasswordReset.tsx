import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
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
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
 
export function PasswordReset() {
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const userEmail = useQuery(api.user.getUserEmailById);
  const [step, setStep] = useState<"forgot" | { email: string } | "success">("forgot");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Check if we're returning to the page after email was sent
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('passwordResetEmail');
    const emailSentFlag = sessionStorage.getItem('passwordResetEmailSent');
    
    if (savedEmail && emailSentFlag === 'true') {
      setStep({ email: savedEmail });
      setEmailSent(true);
    }
  }, []);

  const handleForgotPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      // Use logged-in user's email if available, otherwise get from form
      const email = isAuthenticated && userEmail ? userEmail : (formData.get("email") as string);
      
      // Set the flow to reset and submit
      formData.set("flow", "reset");
      formData.set("email", email);
      
      // This will send the reset email and may log the user out (which is expected)
      await signIn("password", formData);
      
      // If we get here, the email was sent successfully
      setEmailSent(true);
      setStep({ email });
      // Save to sessionStorage in case user gets redirected
      sessionStorage.setItem('passwordResetEmail', email);
      sessionStorage.setItem('passwordResetEmailSent', 'true');
    } catch (submissionError) {
      // Even if there's an error, we might still want to show the next step
      // because the email could have been sent but the user got logged out
      const formData = new FormData(event.currentTarget);
      const email = isAuthenticated && userEmail ? userEmail : (formData.get("email") as string);
      
      // Check if this is likely a logout-related error vs a real error
      const errorMessage = submissionError instanceof Error ? submissionError.message : "";
      
      if (errorMessage.includes("logout") || errorMessage.includes("session") || emailSent) {
        // User was logged out but email was likely sent
        setEmailSent(true);
        setStep({ email });
        // Save to sessionStorage in case user gets redirected
        sessionStorage.setItem('passwordResetEmail', email);
        sessionStorage.setItem('passwordResetEmailSent', 'true');
      } else {
        setError("Failed to send reset code. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("password", formData);
      setStep("success");
      // Clear sessionStorage on successful reset
      sessionStorage.removeItem('passwordResetEmail');
      sessionStorage.removeItem('passwordResetEmailSent');
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to reset password. Please check your code and try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex flex-col gap-6">
        <Card className="w-96 mx-auto">
          <CardHeader>
            <CardTitle className="text-green-600">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been successfully reset. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = "/"}
            >
              Return to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-svh">
      <Card className="w-96 mx-auto">
        <CardHeader>
          <CardTitle>
            {step === "forgot" ? "Reset Your Password" : "Enter Reset Code"}
          </CardTitle>
          <CardDescription>
            {step === "forgot" 
              ? isAuthenticated && userEmail 
                ? `We'll send a reset code to your registered email address (${userEmail}).`
                : "Enter your email address and we'll send you a reset code."
              : emailSent 
                ? `We've sent a reset code to ${step.email}. Check your email and enter the code below along with your new password.`
                : `Enter the reset code sent to ${step.email} along with your new password.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "forgot" ? (
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  {isAuthenticated && userEmail ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={userEmail}
                        readOnly
                      />
                      <span className="text-sm text-green-600">✓</span>
                    </div>
                  ) : (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  )}
                  {isAuthenticated && userEmail && (
                    <FieldDescription className="text-sm text-blue-600">
                      ✓ Using your logged-in account email
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Reset Code"}
                  </Button>
                  { !isAuthenticated && <FieldDescription className="text-center">
                    Remember your password?{" "}
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:no-underline"
                      onClick={() => window.location.href = "/"}
                      disabled={isSubmitting}
                    >
                      Sign in instead
                    </button>
                  </FieldDescription>}
                  {error && (
                    <FieldDescription className="text-center text-destructive">
                      {error}
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
              <input name="flow" type="hidden" value="reset" />
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handlePasswordReset}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="code">Reset Code</FieldLabel>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Enter 8-digit code"
                    autoComplete="one-time-code"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Field>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </Button>
                  {emailSent && (
                    <FieldDescription className="text-center text-blue-600">
                      ✓ Reset code sent! Check your email for the 8-digit code.
                    </FieldDescription>
                  )}
                  <FieldDescription className="text-center text-sm text-gray-600">
                    Note: You may have been logged out for security. This is normal - just enter your code below.
                  </FieldDescription>
                  <FieldDescription className="text-center">
                    <button
                      type="button"
                      className="underline underline-offset-4 hover:no-underline"
                      onClick={() => setStep("forgot")}
                      disabled={isSubmitting}
                    >
                      Back to email
                    </button>
                  </FieldDescription>
                  {error && (
                    <FieldDescription className="text-center text-destructive">
                      {error}
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>
              <input name="email" value={step.email} type="hidden" />
              <input name="flow" value="reset-verification" type="hidden" />
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}