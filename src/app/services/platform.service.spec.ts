import { TestBed } from '@angular/core/testing';
import { PlatformService } from './platform.service';

describe('PlatformService', () => {
  let service: PlatformService;

  beforeEach(() => {
    // jsdom doesn't implement matchMedia — PlatformService calls it synchronously
    // in the browser to get an initial isMobile value before BreakpointObserver fires
    /* eslint-disable @typescript-eslint/no-empty-function -- mock MediaQueryList stub, no-op by design */
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

    TestBed.configureTestingModule({});
    service = TestBed.inject(PlatformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have isBrowser as a boolean', () => {
    expect(typeof service.isBrowser).toBe('boolean');
  });

  it('should have isMobile signal with initial value false', () => {
    expect(service.isMobile()).toBe(false);
  });
});
