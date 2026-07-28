import { Injectable, isDevMode } from '@angular/core';
import { CategoryEnum, portfolios } from '@app/constants';
import {
  createPortfolioId,
  type PortfolioItem,
} from '@entities/portfolio-item/portfolio-item.model';
import { PortfolioRepository } from '@entities/portfolio-item/portfolio-item.repository';

// artificial latency so the COMMIT button's saving → saved transition is actually
// observable while the real backend does not exist yet
const FAKE_LATENCY_MS = 450;

/** Flattens the compile-time `portfolios` record into the editor's domain shape. */
function seedFromConstants(): PortfolioItem[] {
  return Object.values(CategoryEnum).flatMap((category) =>
    portfolios[category].map((video, index) => ({
      id: createPortfolioId(),
      title: video.title,
      videoId: video.videoId,
      preview: video.preview,
      category,
      asBackground: video.asBackground ?? false,
      order: index,
    })),
  );
}

/**
 * Iteration-1 adapter for {@link PortfolioRepository}: seeds from `@app/constants` and
 * keeps writes in memory for the lifetime of the tab. Replaced by an HTTP adapter over
 * `GET/PUT /api/portfolio` (Netlify Blobs) without touching the store or any component.
 */
@Injectable({ providedIn: 'root' })
export class InMemoryPortfolioRepository extends PortfolioRepository {
  private snapshot: PortfolioItem[] = seedFromConstants();

  public override load(): Promise<PortfolioItem[]> {
    // structuredClone so a caller mutating the returned array cannot corrupt the store
    return Promise.resolve(structuredClone(this.snapshot));
  }

  public override save(items: PortfolioItem[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.snapshot = structuredClone(items);
        if (isDevMode()) {
          console.info(
            `[portfolio-admin] saved ${String(items.length)} clips (in-memory adapter)`,
          );
        }
        resolve();
      }, FAKE_LATENCY_MS);
    });
  }
}
