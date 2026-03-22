import { TestBed } from '@angular/core/testing';
import { SafePipe } from './safe.pipe';

describe('SafePipe', () => {
  let pipe: SafePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SafePipe],
    });
    pipe = TestBed.inject(SafePipe);
  });

  it('should return null for null input', () => {
    expect(pipe.transform(null, 'html')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(pipe.transform('', 'html')).toBeNull();
  });

  it('should transform html type', () => {
    const result = pipe.transform('<b>test</b>', 'html');
    expect(result).toBeTruthy();
  });

  it('should transform style type', () => {
    const result = pipe.transform('color: red', 'style');
    expect(result).toBeTruthy();
  });

  it('should transform url type', () => {
    const result = pipe.transform('https://example.com', 'url');
    expect(result).toBeTruthy();
  });

  it('should transform resourceUrl type', () => {
    const result = pipe.transform('https://example.com/video.mp4', 'resourceUrl');
    expect(result).toBeTruthy();
  });

  it('should default to html for unknown type', () => {
    const result = pipe.transform('<p>test</p>', 'unknown');
    expect(result).toBeTruthy();
  });
});
