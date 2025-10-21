import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";
import { ResendOTP } from "./ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({reset: ResendOTPPasswordReset, verify: ResendOTP})],
});
