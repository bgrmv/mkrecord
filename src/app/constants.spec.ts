import { CategoryEnum, portfolios } from './constants';

describe('Constants', () => {
  describe('CategoryEnum', () => {
    it('should have Horizontal and Vertical values', () => {
      expect(CategoryEnum.Horizontal).toBe('horizontal');
      expect(CategoryEnum.Vertical).toBe('vertical');
    });
  });

  describe('portfolios', () => {
    it('should have horizontal and vertical categories', () => {
      expect(portfolios[CategoryEnum.Horizontal]).toBeDefined();
      expect(portfolios[CategoryEnum.Vertical]).toBeDefined();
    });

    it('should have non-empty horizontal videos', () => {
      expect(portfolios[CategoryEnum.Horizontal].length).toBeGreaterThan(0);
    });

    it('should have non-empty vertical videos', () => {
      expect(portfolios[CategoryEnum.Vertical].length).toBeGreaterThan(0);
    });

    it('every video should have required fields', () => {
      const allVideos = [
        ...portfolios[CategoryEnum.Horizontal],
        ...portfolios[CategoryEnum.Vertical],
      ];

      for (const video of allVideos) {
        expect(video.title).toBeTruthy();
        expect(video.preview).toBeTruthy();
        expect(video.videoId).toBeTruthy();
        expect(video.category).toBeTruthy();
      }
    });

    it('horizontal videos should have correct category', () => {
      for (const video of portfolios[CategoryEnum.Horizontal]) {
        expect(video.category).toBe(CategoryEnum.Horizontal);
      }
    });

    it('vertical videos should have correct category', () => {
      for (const video of portfolios[CategoryEnum.Vertical]) {
        expect(video.category).toBe(CategoryEnum.Vertical);
      }
    });

    it('should have at least one background video in horizontal', () => {
      const bgVideos = portfolios[CategoryEnum.Horizontal].filter(
        (v) => v.asBackground,
      );
      expect(bgVideos.length).toBeGreaterThan(0);
    });
  });
});
