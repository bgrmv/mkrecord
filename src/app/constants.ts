import { PortfolioCategory } from './types';

export enum CategoryEnum {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

/**
 * 
 * ✅ Рекомендованные размеры превью для галереи/портфолио:
Размер	Пиксели	Где хорошо работает
480×270	(16:9)	Миниатюры в сетке, быстро грузятся
640×360	(16:9)	Более крупные превью с деталями
800×450	(16:9)	На планшетах, Retina дисплеях
960×540	(16:9)	Качественные, но всё ещё лёгкие */

const PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH =
  'assets/portfolio/horizontal/480x270';
const PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH =
  'assets/portfolio/vertical/540x960';

const horizontalVideos: PortfolioCategory[] = [
  {
    title: 'Don Lounge Place DLP',
    category: CategoryEnum.Horizontal,
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/bar_480x270.webm`,
    videoId: 'rFGxVhX-cIo',
  },
  {
    title: 'Chef card 2020',
    category: CategoryEnum.Horizontal,
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/cookerdoc_480x270.webm`,
    videoId: 'WpQ9We4P3SY',
  },
  {
    title: 'EcoDoge Biodegradable Dog Waste Bags',
    category: CategoryEnum.Horizontal,
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/dogcoin_480x270.webm`,
    videoId: 'A_oNTNvIlk0',
  },
  {
    title: 'Summer Event - Lucky Strike 2025',
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/event_6_480x270.webm`,
    videoId: 'PwYSRVlcPiQ',
    category: CategoryEnum.Horizontal,
  },
  {
    title: 'Sheep - 1 minute short film',
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/movie1min_480x270.webm`,
    videoId: 'tfBvJPhKDC4',
    category: CategoryEnum.Horizontal,
  },
  {
    title: 'The Heart Behind AMDA: Inspiring Youth Through Global Education',
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/podcast1_480x270.webm`,
    videoId: '8gb1c210VsI',
    category: CategoryEnum.Horizontal,
  },
  {
    title: 'Right Here Waiting cover - Funky MAF',
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/song_480x270.webm`,
    videoId: 'iMm1RVvJQn8',
    category: CategoryEnum.Horizontal,
  },
  {
    title: 'SAPRA: Global Alliance of Defence Product Manufacturers',
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/speaker_480x270.webm`,
    videoId: 'g3JLLp1EZxE',
    category: CategoryEnum.Horizontal,
  },
  {
    title: 'Startup Event',
    preview: `${PORTFOLIO_HORIZONTAL_ASSET_SOURCE_PATH}/hacker_480x270.webm`,
    videoId: 'Cui3R2zhiYs',
    category: CategoryEnum.Horizontal,
  },
];

const verticalVideos: PortfolioCategory[] = [
  {
    title: 'Adidas',
    category: CategoryEnum.Vertical,
    preview: `${PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH}/reelsgif_540x960.webm`, // Reels1
    videoId: 'zPdz1fWr8vU',
  },
  {
    title: 'Body Language - Dance video',
    category: CategoryEnum.Vertical,
    preview: `${PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH}/reels2dance_540x960.webm`, // reels2dance
    videoId: 'qWJlQGqXulA',
  },
  {
    title: 'Masterclass: The Art of Cocktail Making',
    category: CategoryEnum.Vertical,
    preview: `${PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH}/Reels3bar_540x960.webm`, // Reels3bar
    videoId: '59LURni3C4E',
  },
  {
    title: 'THE DEDICATION CEREMONY INTO THE TATTOO CULTURE',
    category: CategoryEnum.Vertical,
    preview: `${PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH}/Reels5_540x960.webm`, // Reels5
    videoId: 'xSRh66AEkik',
  },
  {
    title: 'Luxury in the Details: Dainty Jewelry & Designer Mini Bag',
    category: CategoryEnum.Vertical,
    preview: `${PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH}/Reels6_540x960.webm`, // Reels6
    videoId: 'ikv_98KHOaE',
  },
  {
    title: 'Mastering the Art of Perfect Brows',
    category: CategoryEnum.Vertical,
    preview: `${PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH}/Reels7_540x960.webm`, // Reels7
    videoId: '8RkJtt3cQQc',
  },
  {
    title: 'Forget Socks – A Tattoo Is the Best Christmas Present!',
    category: CategoryEnum.Vertical,
    preview: `${PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH}/Reels8_540x960.webm`, // Reels8
    videoId: 'QI0cfe2hZcQ',
  },
  {
    title: 'Tattoo Master at Work: Art That Lives on Skin',
    category: CategoryEnum.Vertical,
    preview: `${PORTFOLIO_VERTICAL_ASSET_SOURCE_PATH}/Reels9_540x960.webm`, // Reels9
    videoId: 'H7pAZtVKcyg',
  },
];

export const portfolios: Record<CategoryEnum, PortfolioCategory[]> = {
  [CategoryEnum.Horizontal]: horizontalVideos,
  [CategoryEnum.Vertical]: verticalVideos,
};
