export const environment = {
  production: true,
  siteUrl: 'https://mkrecord.azurewebsites.net',
  featureFlags: {
    customCursor: false,
    // /dashboard has no authentication yet — keep it out of production builds entirely
    dashboard: false,
    cookieConsent: true,
  },
};
