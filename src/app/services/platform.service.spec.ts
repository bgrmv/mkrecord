import { TestBed } from '@angular/core/testing';
import { PlatformService } from './platform.service';

describe('PlatformService', () => {
  let service: PlatformService;

  beforeEach(() => {
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
