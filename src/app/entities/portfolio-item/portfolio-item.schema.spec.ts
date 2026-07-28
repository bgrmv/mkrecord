import { CategoryEnum } from '@app/constants';
import { PREVIEW_ROOT, type PortfolioDraft } from './portfolio-item.model';
import { parseDraft, portfolioListSchema } from './portfolio-item.schema';

function draft(overrides: Partial<PortfolioDraft> = {}): PortfolioDraft {
  return {
    title: 'Don Lounge Place DLP',
    videoId: 'rFGxVhX-cIo',
    preview: `${PREVIEW_ROOT[CategoryEnum.Horizontal]}/bar_480x270.webm`,
    category: CategoryEnum.Horizontal,
    asBackground: false,
    ...overrides,
  };
}

describe('portfolioDraftSchema', () => {
  it('accepts a well-formed draft', () => {
    expect(parseDraft(draft()).ok).toBe(true);
  });

  it('rejects a videoId that is not 11 characters', () => {
    const result = parseDraft(draft({ videoId: 'tooshort' }));
    expect(result.ok).toBe(false);
  });

  it('rejects a preview outside the category asset root', () => {
    const result = parseDraft(
      draft({
        preview: `${PREVIEW_ROOT[CategoryEnum.Vertical]}/reels1_540x960.webm`,
      }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects a preview that is not a .webm file', () => {
    const result = parseDraft(
      draft({
        preview: `${PREVIEW_ROOT[CategoryEnum.Horizontal]}/bar_480x270.mp4`,
      }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects a vertical clip flagged as background', () => {
    const result = parseDraft(
      draft({
        category: CategoryEnum.Vertical,
        preview: `${PREVIEW_ROOT[CategoryEnum.Vertical]}/reels1_540x960.webm`,
        asBackground: true,
      }),
    );
    expect(result.ok).toBe(false);
  });

  it('rejects a title shorter than three characters', () => {
    expect(parseDraft(draft({ title: 'ab' })).ok).toBe(false);
  });
});

describe('portfolioListSchema', () => {
  const item = (asBackground: boolean) => ({
    ...draft({ asBackground }),
    id: 'id-1',
    order: 0,
  });

  it('accepts a list with at least one background clip', () => {
    expect(portfolioListSchema.safeParse([item(true)]).success).toBe(true);
  });

  // guards BackgroundService.getRandomVideoSrc, which loops forever on an empty pool
  it('rejects a list with no background clip', () => {
    expect(portfolioListSchema.safeParse([item(false)]).success).toBe(false);
  });
});
