import { CategoryEnum } from '@app/constants';
import { z } from 'zod';
import {
  PREVIEW_ROOT,
  YOUTUBE_ID_PATTERN,
  type PortfolioDraft,
} from './portfolio-item.model';

/**
 * Domain invariants for a portfolio clip — the single source of truth shared by the
 * edit form (client) and, in the next iteration, the `PUT /api/portfolio` handler
 * (server). Keeping one schema means the server can never accept something the UI
 * rejected, or vice versa.
 *
 * Framework-free on purpose: no Angular imports, so a Netlify function can import it.
 */
export const portfolioDraftSchema = z
  .object({
    id: z.string().optional(),
    title: z
      .string()
      .trim()
      .min(3, 'Title is too short')
      .max(120, 'Title is too long'),
    videoId: z
      .string()
      .trim()
      .regex(YOUTUBE_ID_PATTERN, 'Must be an 11-character YouTube id'),
    preview: z
      .string()
      .trim()
      .endsWith('.webm', 'Preview must be a .webm file'),
    category: z.enum(CategoryEnum),
    asBackground: z.boolean(),
  })
  .superRefine((draft, ctx) => {
    // the preview root encodes the aspect ratio (480x270 vs 540x960), so a path from the
    // wrong category would render letterboxed — catch it here rather than visually
    const root = PREVIEW_ROOT[draft.category];
    if (!draft.preview.startsWith(`${root}/`)) {
      ctx.addIssue({
        code: 'custom',
        path: ['preview'],
        message: `Preview must live under ${root}/`,
      });
    }

    // BackgroundService builds its rotation from portfolios[Horizontal].filter(asBackground),
    // so flagging a vertical clip silently does nothing — reject it instead of pretending
    if (draft.asBackground && draft.category !== CategoryEnum.Horizontal) {
      ctx.addIssue({
        code: 'custom',
        path: ['asBackground'],
        message: 'Only horizontal clips can be used as background',
      });
    }
  });

export const portfolioItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(120),
  videoId: z.string().regex(YOUTUBE_ID_PATTERN),
  preview: z.string().endsWith('.webm'),
  category: z.enum(CategoryEnum),
  asBackground: z.boolean(),
  order: z.number().int().nonnegative(),
});

/**
 * Aggregate-level invariant: at least one horizontal clip must stay flagged as background.
 *
 * `getRandomVideoSrc` in background-service.ts loops `while (true)` picking a random
 * background clip that differs from the current one — an empty list makes it spin forever
 * (already tracked as P0 #6). The editor must never be able to produce that state.
 */
export const portfolioListSchema = z
  .array(portfolioItemSchema)
  .superRefine((items, ctx) => {
    if (!items.some((item) => item.asBackground)) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one horizontal clip must be marked as background',
      });
    }
  });

/** First human-readable message from a failed parse, or `null` when the parse succeeded. */
export function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid data';
}

export function parseDraft(
  value: PortfolioDraft,
): { ok: true; data: PortfolioDraft } | { ok: false; error: string } {
  const result = portfolioDraftSchema.safeParse(value);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, error: firstIssueMessage(result.error) };
}
