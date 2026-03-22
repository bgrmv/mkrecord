import { DurationPipe } from './duration.pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('should format zero milliseconds', () => {
    expect(pipe.transform(0)).toBe('00:00:00');
  });

  it('should format seconds only', () => {
    expect(pipe.transform(5000)).toBe('00:00:05');
  });

  it('should format minutes and seconds', () => {
    expect(pipe.transform(65000)).toBe('00:01:05');
  });

  it('should format hours, minutes and seconds', () => {
    expect(pipe.transform(3661000)).toBe('01:01:01');
  });

  it('should pad single digits', () => {
    expect(pipe.transform(1000)).toBe('00:00:01');
  });

  it('should return "Invalid duration" for negative values', () => {
    expect(pipe.transform(-1)).toBe('Invalid duration');
  });

  it('should handle large durations', () => {
    expect(pipe.transform(86400000)).toBe('24:00:00');
  });
});
