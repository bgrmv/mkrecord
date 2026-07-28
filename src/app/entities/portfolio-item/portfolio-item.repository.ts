import type { PortfolioItem } from './portfolio-item.model';

/**
 * Port between the editor and whatever actually stores the portfolio.
 *
 * use an abstract class rather than an InjectionToken because Angular accepts it as
 * both the DI token and the type — no separate `InjectionToken<T>` const to keep in sync.
 *
 * Iteration 1 binds this to `InMemoryPortfolioRepository`; iteration 2 swaps in an
 * adapter over `GET/PUT /api/portfolio` (Netlify Blobs) by changing one provider in
 * app.config.ts. Nothing above this line knows which one is live.
 */
export abstract class PortfolioRepository {
  public abstract load(): Promise<PortfolioItem[]>;
  public abstract save(items: PortfolioItem[]): Promise<void>;
}
