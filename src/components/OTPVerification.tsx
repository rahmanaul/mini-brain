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
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowLeft } from "lucide-react";

interface OTPVerificationProps {
  email?: string;
  onBack?: () => void;
}

export function OTPVerification({ email, onBack }: OTPVerificationProps) {
  const { signIn } = useAuthActions();
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState(email || "");

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !userEmail) return;

    setIsVerifying(true);
    setStatus("pending");
    setMessage("");

    try {
      // Use Convex Auth to verify the OTP code
      await signIn("password", {
        email: userEmail,
        password: "", // Password not needed for OTP verification
        code: otpCode,
        flow: "email-verification", // Required flow parameter for OTP verification
      });

      setStatus("success");
      setMessage("Email verified successfully! You can now sign in.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error 
          ? error.message 
          : "Invalid verification code. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userEmail) return;

    setIsResending(true);
    try {
      // Trigger OTP resend by attempting sign in
      await signIn("password", {
        email: userEmail,
        password: "", // This will trigger OTP send
        flow: "email-verification", // Required flow parameter for OTP resend
      });
      
      setMessage("Verification code sent! Please check your email.");
      setStatus("pending");
    } catch (error) {
      setMessage(
        error instanceof Error 
          ? error.message 
          : "Failed to resend verification code"
      );
      setStatus("error");
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "error":
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Mail className="h-12 w-12 text-blue-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case "success":
        return "Email Verified Successfully!";
      case "error":
        return "Verification Failed";
      default:
        return "Verify Your Email";
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case "success":
        return "Your email has been verified successfully. You can now sign in to your account.";
      case "error":
        return "There was an error verifying your email. Please check the code and try again.";
      default:
        return `We've sent a verification code to ${userEmail}. Please enter the code below to verify your email address.`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl font-bold">
              {getStatusTitle()}
            </CardTitle>
            <CardDescription>
              {getStatusDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div className={cn(
                "p-4 rounded-lg mb-6",
                status === "success" 
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : status === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              )}>
                {message}
              </div>
            )}

            {status !== "success" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      disabled={!!email} // Disable if email is provided as prop
                    />
                    <FieldDescription>
                      {email ? "Email address for verification" : "Enter your email address"}
                    </FieldDescription>
                  </Field>
                  
                  <Field>
                    <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 8-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      maxLength={8}
                      required
                      className="text-center text-lg tracking-widest"
                    />
                    <FieldDescription>
                      Enter the 8-digit verification code sent to your email
                    </FieldDescription>
                  </Field>
                  
                  <Field>
                    <Button 
                      type="submit"
                      disabled={!otpCode || !userEmail || isVerifying}
                      className="w-full"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Email"
                      )}
                    </Button>
                  </Field>
                  
                  <Field>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleResendOTP}
                      disabled={!userEmail || isResending}
                      className="w-full"
                    >
                      {isResending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Resend Verification Code
                        </>
                      )}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="w-full"
                >
                  Go to Sign In
                </Button>
                
                {onBack && (
                  <Button 
                    variant="outline"
                    onClick={onBack}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign Up
                  </Button>
                )}
              </div>
            )}

            {onBack && status !== "success" && (
              <div className="text-center mt-4">
                <Button 
                  variant="ghost"
                  onClick={onBack}
                  className="text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Sign Up
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a 
              href="mailto:support@minibrain.com" 
              className="text-blue-600 hover:text-blue-500 underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
