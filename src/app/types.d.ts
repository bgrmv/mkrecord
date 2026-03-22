import { CategoryEnum } from './constants';

type Language = 'en' | 'lv' | 'ru';

interface PortfolioCategory {
  title: string;
  preview: string;
  videoId: string;
  category: import('./constants').CategoryEnum;
  asBackground?: boolean;
}

type Portfolio = Record<CategoryEnum, PortfolioCategory[]>;
