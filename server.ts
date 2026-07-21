import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import { render } from '@netlify/angular-runtime/common-engine.js';
import { config } from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import bootstrap from './src/main.server';

// load .env in development; Azure App Settings / Netlify env vars inject vars into process.env in production
config();

// use by the Express (Azure) contact route below — Netlify routes /api/contact to its own
// Node.js function (netlify/functions/contact.ts) instead, since nodemailer needs real
// net/tls sockets that the Deno-based Edge Function serving SSR doesn't fully support
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

// shared between the Express (Azure) and fetch-based (Netlify Function) handlers below
async function sendContactMail(body: unknown): Promise<{ status: number; payload: object }> {
  const parsed = ContactSchema.safeParse(body);

  if (!parsed.success) {
    return { status: 400, payload: { error: 'invalid' } };
  }

  if (!process.env['SMTP_USER'] || !process.env['SMTP_PASS'] || !process.env['MAIL_TO']) {
    return { status: 503, payload: { error: 'email_not_configured' } };
  }

  try {
    await transporter.sendMail({
      from: `"mkrecstudio" <${process.env['SMTP_USER']}>`,
      to: process.env['MAIL_TO'],
      // use replyTo (not From) for user's address — nodemailer escapes it, prevents header injection
      replyTo: parsed.data.email,
      subject: 'New request from mkrecstudio.com',
      text: parsed.data.text,
    });
    return { status: 200, payload: { ok: true } };
  } catch (err) {
    // log server-side only — response body stays generic so we don't leak SMTP internals to the client
    console.error('sendContactMail failed:', err instanceof Error ? err.message : err);
    return { status: 500, payload: { error: 'send_failed' } };
  }
}

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  // Angular 22's CommonEngine validates the request Host header by default and rejects
  // anything not in allowedHosts (SSR host-header-injection hardening). Both Azure Web
  // Apps and Netlify only route traffic for hostnames actually bound to this app — an
  // attacker can't reach this process with a spoofed Host in the first place — so the
  // platform routing layer already covers what this check defends against.
  const commonEngine = new CommonEngine({ allowedHosts: ['*'] });

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
    const { status, payload } = await sendContactMail(req.body);
    res.status(status).json(payload);
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

// Netlify Angular Runtime entry point — fetch-based handler, no Express here (edge/serverless runtime).
// same allowedHosts rationale as the Express instance above — Netlify's own routing already
// gates which Host headers can reach this function.
const commonEngine = new CommonEngine({ allowedHosts: ['*'] });

export async function netlifyCommonEngineHandler(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);

  // netlify.toml's [[redirects]] for /api/contact never actually fires — this Edge Function
  // is bound broadly enough that it wins over the redirect. Proxy to the Node.js function
  // instead: Deno's fetch() is fine, it's raw SMTP sockets that don't work here.
  if (pathname === '/api/contact' && request.method === 'POST') {
    const functionUrl = new URL('/.netlify/functions/contact', request.url);
    const proxied = await fetch(functionUrl, {
      method: 'POST',
      headers: request.headers,
      body: request.body,
      // @ts-expect-error — duplex is required by undici/Deno when streaming a body but missing from the lib.dom RequestInit type
      duplex: 'half',
    });
    return proxied;
  }

  const response = await render(commonEngine);
  // Security headers on every response — mirrors the Express middleware above
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

// only start the Express listener when this file is run directly (Azure's `node server.mjs`);
// Netlify's build imports this module solely for `netlifyCommonEngineHandler`, and must not
// have a side effect of opening a port
if (isMainModule(import.meta.url)) {
  run();
}
