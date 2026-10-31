import nodemailer from "nodemailer";
import { env } from "../config/env.js";

export const mailConfigured = Boolean(env.smtp.host && env.smtp.from);

const transport = mailConfigured
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    })
  : null;

export async function sendMail({ to, subject, text, html }) {
  if (!transport) {
    console.log(`\n[email not sent: SMTP_HOST is empty] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  await transport.sendMail({ from: env.smtp.from, to, subject, text, html });
}

export function sendVerificationEmail(user, link) {
  return sendMail({
    to: user.email,
    subject: "Confirm your Scrapify email",
    text: `Hi ${user.name},\n\nConfirm your email to finish creating your Scrapify account:\n${link}\n\nThe link works for 24 hours. If you didn't sign up, ignore this email.`,
    html: `<p>Hi ${escapeHtml(user.name)},</p>
<p>Confirm your email to finish creating your Scrapify account:</p>
<p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#1f5135;color:#fff;border-radius:8px;text-decoration:none">Confirm my email</a></p>
<p style="color:#666;font-size:13px">Or open this link: ${link}<br>It works for 24 hours. If you didn't sign up, ignore this email.</p>`,
  });
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
