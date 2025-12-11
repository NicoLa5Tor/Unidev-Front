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
  },
  auth: {
    oidc: {
      authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_m92TYnPrH',
      clientId: '37akb5r5hqpa9jgr25oa9ju5m8',
      cognitoDomain: 'https://unidev.auth.us-east-1.amazoncognito.com',
      redirectUrl: 'http://localhost:5050/callback',
      postLogoutRedirectUri: 'http://localhost:5050/logout',
      scope: 'openid email profile',
      responseType: 'code'
    }
  }
};
