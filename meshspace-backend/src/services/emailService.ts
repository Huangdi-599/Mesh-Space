import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import dotenv from 'dotenv';

dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST!,
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
  secure: false,
  tls: {
    ciphers: 'SSLv3', 
    rejectUnauthorized: false, // Allow self-signed certificates
  },
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
} as SMTPTransport.Options);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: 'MeshSpace <no-reply@meshspace.io>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const html = `<p>Please verify your account by clicking <a href="${verificationUrl}">here</a>.</p>`;
  try {
    await sendEmail(email, 'Verify your MeshSpace account', html);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
    throw error;
  }
};