import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const resend: Resend = new Resend(components.resend, { testMode: false });

export const sendTestEmail = internalMutation({
  handler: async (ctx) => {
    await resend.sendEmail(ctx, {
      from: "Me <minibrain@aulia-rahman.com>",
      to: "rahmannauliaaa@gmail.com",
      subject: "Hi there",
      html: "This is a test email from Convex and Resend",
    })
    .catch((error) => {
      console.error(error);
    });
  },
})

export const sendVerificationEmail = internalMutation({
    args: {
        email: v.string(),
        verificationToken: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const verificationUrl = `${process.env.BASE_URL}/verify-email?verificationToken=${args.verificationToken}`;
        
        await resend.sendEmail(ctx, {
            from: "MiniBrain <minibrain@aulia-rahman.com>",
            to: args.email,
            subject: "Welcome to MiniBrain - Verify Your Email",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                            background-color: #f8fafc;
                            line-height: 1.6;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 30px;
                            text-align: center;
                            color: white;
                        }
                        .logo {
                            font-size: 32px;
                            font-weight: bold;
                            margin-bottom: 10px;
                            letter-spacing: -0.5px;
                        }
                        .tagline {
                            font-size: 16px;
                            opacity: 0.9;
                            margin: 0;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .welcome-title {
                            font-size: 28px;
                            font-weight: 600;
                            color: #1a202c;
                            margin: 0 0 20px 0;
                            text-align: center;
                        }
                        .message {
                            font-size: 16px;
                            color: #4a5568;
                            margin-bottom: 30px;
                            text-align: center;
                        }
                        .verify-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-decoration: none;
                            padding: 16px 32px;
                            border-radius: 8px;
                            font-weight: 600;
                            font-size: 16px;
                            text-align: center;
                            margin: 20px auto;
                            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                            transition: all 0.3s ease;
                        }
                        .verify-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                        }
                        .button-container {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .security-note {
                            background-color: #f7fafc;
                            border-left: 4px solid #4299e1;
                            padding: 20px;
                            margin: 30px 0;
                            border-radius: 0 8px 8px 0;
                        }
                        .security-title {
                            font-weight: 600;
                            color: #2d3748;
                            margin: 0 0 10px 0;
                            font-size: 14px;
                        }
                        .security-text {
                            font-size: 14px;
                            color: #4a5568;
                            margin: 0;
                        }
                        .footer {
                            background-color: #f8fafc;
                            padding: 30px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer-text {
                            font-size: 14px;
                            color: #718096;
                            margin: 0 0 10px 0;
                        }
                        .footer-link {
                            color: #667eea;
                            text-decoration: none;
                        }
                        .footer-link:hover {
                            text-decoration: underline;
                        }
                        .divider {
                            height: 1px;
                            background-color: #e2e8f0;
                            margin: 30px 0;
                        }
                        .alternative-link {
                            background-color: #f7fafc;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .alternative-text {
                            font-size: 14px;
                            color: #4a5568;
                            margin: 0 0 10px 0;
                        }
                        .link-text {
                            font-size: 12px;
                            color: #718096;
                            word-break: break-all;
                            font-family: monospace;
                        }
                        @media (max-width: 600px) {
                            .container {
                                margin: 0;
                                box-shadow: none;
                            }
                            .header, .content, .footer {
                                padding: 20px;
                            }
                            .welcome-title {
                                font-size: 24px;
                            }
                            .verify-button {
                                padding: 14px 28px;
                                font-size: 15px;
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
                            <h1 class="welcome-title">Welcome to MiniBrain!</h1>
                            <p class="message">
                                Thank you for joining MiniBrain! We're excited to help you organize your thoughts and boost your productivity with AI-powered note-taking.
                            </p>
                            
                            <div class="button-container">
                                <a href="${verificationUrl}" class="verify-button">
                                    Verify Your Email Address
                                </a>
                            </div>
                            
                            <div class="security-note">
                                <h3 class="security-title">🔒 Security Notice</h3>
                                <p class="security-text">
                                    This verification link will expire in 24 hours for your security. If you didn't create an account with MiniBrain, you can safely ignore this email.
                                </p>
                            </div>
                            
                            <div class="divider"></div>
                            
                            <div class="alternative-link">
                                <p class="alternative-text">
                                    <strong>Button not working?</strong> Copy and paste this link into your browser:
                                </p>
                                <p class="link-text">${verificationUrl}</p>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p class="footer-text">
                                This email was sent to <strong>${args.email}</strong>
                            </p>
                            <p class="footer-text">
                                If you have any questions, feel free to reach out to our support team.
                            </p>
                            <p class="footer-text">
                                © 2024 MiniBrain. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        })
        .catch((error) => {
            console.error("Failed to send verification email:", error);
        });
        
        return null;
    },
})