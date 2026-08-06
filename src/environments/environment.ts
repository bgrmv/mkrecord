export const environment = {
  production: true,
  siteUrl: 'https://mkrecord.azurewebsites.net',
  featureFlags: {
    customCursor: false,
    // /dashboard has no authentication yet — keep it out of production builds entirely
    dashboard: false,
    // no analytics or third-party cookies are wired up yet, so there's nothing
    // to gain consent for — flip this on once GA4 (docs/improvements #16b) ships
    cookieConsent: false,
  },
};
