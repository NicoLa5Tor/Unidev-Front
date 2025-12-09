export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
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
    amplify: {
      Auth: {
        Cognito: {
          userPoolId: 'us-east-1_m92tynprh',
          userPoolClientId: '3s1612a66m1h6kcp00pbo6h3sp',
          loginWith: {
            oauth: {
              domain: 'us-east-1m92tynprh.auth.us-east-1.amazoncognito.com',
              scopes: ['openid', 'email', 'profile'],
              redirectSignIn: ['http://localhost:5050'],
              redirectSignOut: ['http://localhost:5050'],
              responseType: 'code',
              providers: ['Google', { custom: 'Microsoft' }, 'SignInWithApple']
            }
          }
        }
      }
    }
  }
};
