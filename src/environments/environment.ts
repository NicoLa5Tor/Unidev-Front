export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'UnidevFront',
  enableLogging: true,
  features: {
    enableAnalytics: false,
    enableNotifications: true,
    enableOfflineMode: false
  },
  unicornEmbed: {
    scriptUrl:
      'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js',
    embedHtml:
      '<div class="unicorn-embed" data-us-project="ce0NBgQHVKvkxR9nCdDu" style="width: 100%; height: 100%;"></div>'
  }
};
