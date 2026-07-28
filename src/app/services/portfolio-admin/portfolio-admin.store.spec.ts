import { TestBed } from '@angular/core/testing';
import { CategoryEnum } from '@app/constants';
import {
  PREVIEW_ROOT,
  type PortfolioItem,
} from '@entities/portfolio-item/portfolio-item.model';
import { PortfolioRepository } from '@entities/portfolio-item/portfolio-item.repository';
import { PortfolioAdminStore } from './portfolio-admin.store';

function item(overrides: Partial<PortfolioItem> = {}): PortfolioItem {
  return {
    id: 'h1',
    title: 'Don Lounge Place DLP',
    videoId: 'rFGxVhX-cIo',
    preview: `${PREVIEW_ROOT[CategoryEnum.Horizontal]}/bar_480x270.webm`,
    category: CategoryEnum.Horizontal,
    asBackground: true,
    order: 0,
    ...overrides,
  };
}

class FakeRepository extends PortfolioRepository {
  saved: PortfolioItem[] | null = null;
  seed: PortfolioItem[] = [
    item(),
    item({
      id: 'h2',
      title: 'Chef card 2020',
      videoId: 'WpQ9We4P3SY',
      asBackground: false,
      order: 1,
    }),
    item({
      id: 'v1',
      title: 'Adidas',
      videoId: 'zPdz1fWr8vU',
      category: CategoryEnum.Vertical,
      preview: `${PREVIEW_ROOT[CategoryEnum.Vertical]}/reelsgif_540x960.webm`,
      asBackground: false,
      order: 0,
    }),
  ];

  override load(): Promise<PortfolioItem[]> {
    return Promise.resolve(structuredClone(this.seed));
  }

  override save(items: PortfolioItem[]): Promise<void> {
    this.saved = structuredClone(items);
    return Promise.resolve();
  }
}

describe('PortfolioAdminStore', () => {
  let store: PortfolioAdminStore;
  let repository: FakeRepository;

  beforeEach(async () => {
    repository = new FakeRepository();
    TestBed.configureTestingModule({
      providers: [{ provide: PortfolioRepository, useValue: repository }],
    });
    store = TestBed.inject(PortfolioAdminStore);
    await store.load();
  });

  it('splits clips per category and starts clean', () => {
    expect(store.total()).toBe(3);
    expect(store.horizontal().length).toBe(2);
    expect(store.vertical().length).toBe(1);
    expect(store.isDirty()).toBe(false);
  });

  it('updates an existing clip and marks the aggregate dirty', () => {
    store.upsert({ ...item(), id: 'h1', title: 'Renamed clip' });

    expect(store.items().find((entry) => entry.id === 'h1')?.title).toBe(
      'Renamed clip',
    );
    expect(store.isDirty()).toBe(true);
  });

  it('rejects an invalid draft without touching the aggregate', () => {
    store.upsert({ ...item(), id: 'h1', videoId: 'nope' });

    expect(store.error()).toBeTruthy();
    expect(store.isDirty()).toBe(false);
  });

  it('appends a new clip at the end of its category', () => {
    store.upsert({
      title: 'Startup Event',
      videoId: 'Cui3R2zhiYs',
      preview: `${PREVIEW_ROOT[CategoryEnum.Horizontal]}/hacker_480x270.webm`,
      category: CategoryEnum.Horizontal,
      asBackground: false,
    });

    expect(store.horizontal().length).toBe(3);
    expect(store.horizontal()[2].title).toBe('Startup Event');
  });

  it('removes a clip and renumbers the remaining order', () => {
    store.remove('h2');

    expect(store.total()).toBe(2);
    expect(store.horizontal().map((entry) => entry.order)).toEqual([0]);
  });

  // the aggregate invariant that keeps BackgroundService's rotation pool non-empty
  it('refuses to remove the last background clip', () => {
    store.remove('h1');

    expect(store.total()).toBe(3);
    expect(store.error()).toBeTruthy();
  });

  it('moves a clip within its category', () => {
    store.move('h1', 1);

    expect(store.horizontal().map((entry) => entry.id)).toEqual(['h2', 'h1']);
  });

  it('ignores a move that would leave the category bounds', () => {
    store.move('h1', -1);

    expect(store.horizontal().map((entry) => entry.id)).toEqual(['h1', 'h2']);
  });

  it('refuses to flag a vertical clip as background', () => {
    store.toggleBackground('v1');

    expect(store.items().find((entry) => entry.id === 'v1')?.asBackground).toBe(
      false,
    );
    expect(store.error()).toBeTruthy();
  });

  it('persists on commit and becomes clean again', async () => {
    store.upsert({ ...item(), id: 'h1', title: 'Committed title' });
    await store.commit();

    expect(repository.saved?.find((entry) => entry.id === 'h1')?.title).toBe(
      'Committed title',
    );
    expect(store.isDirty()).toBe(false);
    expect(store.status()).toBe('saved');
  });

  it('rolls back to the last committed state on discard', () => {
    store.upsert({ ...item(), id: 'h1', title: 'Temporary' });
    store.discard();

    expect(store.items().find((entry) => entry.id === 'h1')?.title).toBe(
      'Don Lounge Place DLP',
    );
    expect(store.isDirty()).toBe(false);
  });
});
