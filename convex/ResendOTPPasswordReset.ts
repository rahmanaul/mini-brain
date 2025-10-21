import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
 
export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };
 
    const alphabet = "0123456789";
    const length = 8;
    return generateRandomString(random, alphabet, length);
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: "MiniBrain <minibrain@aulia-rahman.com>",
      to: [email],
      subject: "Your password reset code - MiniBrain",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Code</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background-color: #f8fafc;
                    line-height: 1.6;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 32px 24px;
                    text-align: center;
                    color: white;
                }
                .logo {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .tagline {
                    font-size: 14px;
                    opacity: 0.9;
                    margin: 0;
                }
                .content {
                    padding: 32px 24px;
                    text-align: center;
                }
                .title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #1a202c;
                    margin: 0 0 16px 0;
                }
                .message {
                    font-size: 16px;
                    color: #4a5568;
                    margin-bottom: 32px;
                }
                .code-container {
                    background-color: #f7fafc;
                    border: 2px dashed #cbd5e0;
                    border-radius: 8px;
                    padding: 24px;
                    margin: 24px 0;
                }
                .code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #2d3748;
                    letter-spacing: 8px;
                    font-family: 'Courier New', monospace;
                    margin: 0;
                }
                .code-label {
                    font-size: 14px;
                    color: #718096;
                    margin: 0 0 8px 0;
                }
                .security-note {
                    background-color: #fef5e7;
                    border-left: 4px solid #f6ad55;
                    padding: 16px;
                    margin: 24px 0;
                    border-radius: 0 6px 6px 0;
                }
                .security-text {
                    font-size: 14px;
                    color: #c05621;
                    margin: 0;
                }
                .footer {
                    background-color: #f8fafc;
                    padding: 24px;
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                .footer-text {
                    font-size: 14px;
                    color: #718096;
                    margin: 0;
                }
                @media (max-width: 600px) {
                    .container {
                        margin: 0;
                        border-radius: 0;
                    }
                    .header, .content, .footer {
                        padding: 20px;
                    }
                    .title {
                        font-size: 20px;
                    }
                    .code {
                        font-size: 28px;
                        letter-spacing: 6px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🧠 MiniBrain</div>
                    <p class="tagline">Your AI-Powered Note-Taking Assistant</p>
                </div>
                
                <div class="content">
                    <h1 class="title">Reset Your Password</h1>
                    <p class="message">
                        Use this verification code to reset your password:
                    </p>
                    
                    <div class="code-container">
                        <p class="code-label">Reset Code</p>
                        <p class="code">${token}</p>
                    </div>
                    
                    <div class="security-note">
                        <p class="security-text">
                            ⚠️ This code will expire in 10 minutes for your security.
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <p class="footer-text">
                        If you didn't request a password reset, you can safely ignore this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
    });

    if (error) {
      throw new Error("Could not send");
    }
  },
});