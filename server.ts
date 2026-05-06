import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import { config } from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import bootstrap from './src/main.server';

// load .env in development; Azure App Settings injects vars into process.env in production
config();

const ContactSchema = z.object({
  // refine rejects \r\n to prevent SMTP header injection if the value ever reaches a header
  email: z.string().email().max(254).refine(v => !/[\r\n]/.test(v)),
  text: z.string().min(10).max(5000),
});

// use module-level transporter so the TCP connection pool is reused across requests
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

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.use(express.json({ limit: '10kb' }));

  // Security headers on every response
  server.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Serve static files from /browser — hashed assets cached 1 year; HTML served by Angular below
  server.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      // immutable marks assets as safe to cache forever without revalidation (hash in filename guarantees freshness)
      immutable: true,
    })
  );

  // POST /api/contact — server-side SMTP relay; keeps credentials out of the browser bundle
  server.post('/api/contact', contactLimiter, async (req, res) => {
    const parsed = ContactSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: 'invalid' });
      return;
    }

    if (!process.env['SMTP_USER'] || !process.env['SMTP_PASS'] || !process.env['MAIL_TO']) {
      res.status(503).json({ error: 'email_not_configured' });
      return;
    }

    try {
      await transporter.sendMail({
        from: process.env['SMTP_USER'],
        to: process.env['MAIL_TO'],
        // use replyTo (not From) for user's address — nodemailer escapes it, prevents header injection
        replyTo: parsed.data.email,
        subject: 'mkrecord — new signal',
        text: parsed.data.text,
      });
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: 'send_failed' });
    }
  });

  // All regular routes use the Angular engine
  server.get(/.*/, (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then(html => {
        // SSR HTML must not be cached — each request may have different meta/canonical
        res.setHeader('Cache-Control', 'no-store');
        res.send(html);
      })
      .catch(err => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
