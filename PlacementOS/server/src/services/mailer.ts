import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass,
  },
});

export async function sendOTPEmail(toEmail: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: `"PlacementOS" <${env.smtpUser}>`,
    to: toEmail,
    subject: "Your PlacementOS Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Reset Your Password</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">PlacementOS Account Recovery</p>
        </div>
        <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb;">
          <p style="color: #374151; font-size: 16px;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="background: white; border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #4f46e5;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 13px;">If you did not request this, please ignore this email. Your account is secure.</p>
        </div>
      </div>
    `,
  });
}
