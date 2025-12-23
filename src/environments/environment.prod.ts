export const environment = {
  production: true,
  apiUrl: 'https://back.unidev.site/api',
  appName: 'UnidevFront',
  enableLogging: false,
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableOfflineMode: true
  },
  unicornEmbed: {
    scriptUrl:
      'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js',
    embedHtml:
      '<div class="unicorn-embed" data-us-project="ce0NBgQHVKvkxR9nCdDu" style="width: 100%; height: 100%;"></div>'
  },
  auth: {
    oidc: {
      authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_7axlYpwa5',
      clientId: '4sfn29tps38iodlmtk09p6rncj',
      cognitoDomain: 'https://us-east-17axlypwa5.auth.us-east-1.amazoncognito.com',
      redirectUrl: 'https://unidev.site/callback',
      postLogoutRedirectUri: 'https://unidev.site/',
      scope: 'openid',
      responseType: 'code'
    },
    identityProviders: {
      google: 'Google',
      microsoft: 'AzureSAML'
    }
  }
};
