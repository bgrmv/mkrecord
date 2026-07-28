import { CategoryEnum } from '@app/constants';

/**
 * Domain model of a single portfolio clip.
 *
 * Extends the public-facing `PortfolioCategory` shape (src/app/types.d.ts) with two
 * fields the read-only site never needed but an editor does:
 *  - `id`    — stable identity across edits, so `@for` tracking and delete/move
 *              commands don't rely on array position or on a mutable title
 *  - `order` — explicit position inside its category; the site currently relies on
 *              array order, which cannot survive a round-trip through a JSON store
 */
export interface PortfolioItem {
  id: string;
  title: string;
  videoId: string;
  preview: string;
  category: CategoryEnum;
  /** Eligible for the rotating homepage background (horizontal clips only). */
  asBackground: boolean;
  order: number;
}

/** What the edit form produces — identity and position are owned by the store, not the form. */
export type PortfolioDraft = Omit<PortfolioItem, 'id' | 'order'> & {
  /** absent = create a new clip, present = update the existing one */
  id?: string;
};

/** YouTube video ids are exactly 11 URL-safe base64 characters. */
export const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

/**
 * Asset roots per category — previews must live under one of these.
 * Mirrors the private path constants in `@app/constants`, which the editor cannot import.
 */
export const PREVIEW_ROOT: Record<CategoryEnum, string> = {
  [CategoryEnum.Horizontal]: 'assets/portfolio/horizontal/480x270',
  [CategoryEnum.Vertical]: 'assets/portfolio/vertical/540x960',
};

// use crypto.randomUUID with a fallback because this module is imported during SSR,
// where `crypto` exists on Node 19+ but is not guaranteed by the type-level lib config
export function createPortfolioId(): string {
  const webCrypto = globalThis.crypto as Crypto | undefined;
  return webCrypto?.randomUUID
    ? webCrypto.randomUUID()
    : `pi-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** A blank draft pre-seeded with the only field the user cannot freely choose. */
export function createEmptyDraft(category: CategoryEnum): PortfolioDraft {
  return {
    title: '',
    videoId: '',
    preview: `${PREVIEW_ROOT[category]}/`,
    category,
    asBackground: false,
  };
}

/** YouTube-hosted still, used as the form's live confirmation that the id is real. */
export function youTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
