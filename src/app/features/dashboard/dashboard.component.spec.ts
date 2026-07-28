import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { CategoryEnum } from '@app/constants';
import {
  PREVIEW_ROOT,
  type PortfolioItem,
} from '@entities/portfolio-item/portfolio-item.model';
import { PortfolioRepository } from '@entities/portfolio-item/portfolio-item.repository';
import { PortfolioAdminStore } from '@services/portfolio-admin/portfolio-admin.store';
import { DashboardComponent } from './dashboard.component';

const SEED: PortfolioItem[] = [
  {
    id: 'h1',
    title: 'Don Lounge Place DLP',
    videoId: 'rFGxVhX-cIo',
    preview: `${PREVIEW_ROOT[CategoryEnum.Horizontal]}/bar_480x270.webm`,
    category: CategoryEnum.Horizontal,
    asBackground: true,
    order: 0,
  },
  {
    id: 'h2',
    title: 'Chef card 2020',
    videoId: 'WpQ9We4P3SY',
    preview: `${PREVIEW_ROOT[CategoryEnum.Horizontal]}/cookerdoc_480x270.webm`,
    category: CategoryEnum.Horizontal,
    asBackground: false,
    order: 1,
  },
  {
    id: 'v1',
    title: 'Adidas',
    videoId: 'zPdz1fWr8vU',
    preview: `${PREVIEW_ROOT[CategoryEnum.Vertical]}/reelsgif_540x960.webm`,
    category: CategoryEnum.Vertical,
    asBackground: false,
    order: 0,
  },
];

class FakeRepository extends PortfolioRepository {
  public override load(): Promise<PortfolioItem[]> {
    return Promise.resolve(structuredClone(SEED));
  }
  public override save(): Promise<void> {
    return Promise.resolve();
  }
}

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let store: PortfolioAdminStore;

  beforeEach(async () => {
    // jsdom has no matchMedia; PlatformService reads it synchronously for isMobile
    /* eslint-disable @typescript-eslint/no-empty-function -- MediaQueryList stub */
    window.matchMedia ??= () =>
      ({
        matches: false,
        media: '',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
    /* eslint-enable @typescript-eslint/no-empty-function */

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        { provide: PortfolioRepository, useClass: FakeRepository },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    store = TestBed.inject(PortfolioAdminStore);
    await store.load();
    await fixture.whenStable();
  });

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function clips(): HTMLElement[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>(
        '.clip',
      ),
    );
  }

  it('renders every clip across both reels', () => {
    expect(clips().length).toBe(3);
    expect(text()).toContain('Don Lounge Place DLP');
    expect(text()).toContain('Adidas');
  });

  it('shows the standby pane until a clip is picked', () => {
    expect(text()).toContain('Standby');
  });

  it('opens the editor with the clicked clip loaded', async () => {
    clips()[0].querySelector<HTMLButtonElement>('.clip-open')!.click();
    await fixture.whenStable();

    expect(text()).not.toContain('Standby');
    expect(store.selected()?.id).toBe('h1');

    const title = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('input[formcontrolname="title"]');
    expect(title?.value).toBe('Don Lounge Place DLP');
  });

  it('arms the commit button once the aggregate is dirty', async () => {
    const commit = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>('.commit-btn')!;
    expect(commit.disabled).toBe(true);

    store.move('h1', 1);
    await fixture.whenStable();

    expect(commit.disabled).toBe(false);
    expect(commit.classList).toContain('is-armed');
  });

  it('surfaces a rejected command as an alert', async () => {
    // h1 is the only background clip — the aggregate invariant must block its removal
    store.remove('h1');
    await fixture.whenStable();

    expect(clips().length).toBe(3);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.alert'),
    ).not.toBeNull();
  });
});
