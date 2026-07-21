import type { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';
import { z } from 'zod';

// runs on Netlify's Node.js Lambda runtime (not the Deno Edge Function that serves
// SSR) — nodemailer needs real Node net/tls sockets for SMTP, which Deno doesn't
// fully support, so contact-mail sending is split out into its own function
const ContactSchema = z.object({
  // refine rejects \r\n to prevent SMTP header injection if the value ever reaches a header
  email: z.string().email().max(254).refine(v => !/[\r\n]/.test(v)),
  text: z.string().min(10).max(5000),
});

// use module-level transporter so the TCP connection pool is reused across warm invocations
const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] ?? 'smtp.gmail.com',
  port: Number(process.env['SMTP_PORT'] ?? '587'),
  // use secure:true only for port 465 (implicit TLS); 587 uses STARTTLS (secure:false)
  secure: process.env['SMTP_PORT'] === '465',
  auth: {
    user: process.env['SMTP_USER'] ?? '',
    pass: process.env['SMTP_PASS'] ?? '',
  },
});

// in-memory per-instance limiter; Netlify Functions are stateless across cold starts,
// so this is best-effort rather than a hard guarantee
const contactHits = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const hits = (contactHits.get(ip) ?? []).filter(timestamp => now - timestamp < windowMs);
  hits.push(now);
  contactHits.set(ip, hits);
  return hits.length > 5;
}

const jsonHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

export const handler: Handler = async event => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: jsonHeaders, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  const ip = event.headers['x-nf-client-connection-ip'] ?? 'unknown';
  if (isRateLimited(ip)) {
    return { statusCode: 429, headers: jsonHeaders, body: JSON.stringify({ error: 'rate_limited' }) };
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    body = {};
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return { statusCode: 400, headers: jsonHeaders, body: JSON.stringify({ error: 'invalid' }) };
  }

  if (!process.env['SMTP_USER'] || !process.env['SMTP_PASS'] || !process.env['MAIL_TO']) {
    return { statusCode: 503, headers: jsonHeaders, body: JSON.stringify({ error: 'email_not_configured' }) };
  }

  try {
    await transporter.sendMail({
      from: process.env['SMTP_USER'],
      to: process.env['MAIL_TO'],
      // use replyTo (not From) for user's address — nodemailer escapes it, prevents header injection
      replyTo: parsed.data.email,
      subject: 'New request from mkrecstudio.com',
      text: parsed.data.text,
    });
    return { statusCode: 200, headers: jsonHeaders, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('sendContactMail failed:', err instanceof Error ? err.message : err);
    return { statusCode: 500, headers: jsonHeaders, body: JSON.stringify({ error: 'send_failed' }) };
  }
};
