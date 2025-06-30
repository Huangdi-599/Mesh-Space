import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: 'MeshSpace <no-reply@meshspace.io>',
    to,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;
  const html = `<p>Please verify your account by clicking <a href="${verificationUrl}">here</a>.</p>`;
  await sendEmail(email, 'Verify your MeshSpace account', html);
};