import { readEnv } from './env.utils';

const defaultApiUrl = 'http://localhost:3000/api';
const defaultOidcConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_7axlYpwa5',
  clientId: '4sfn29tps38iodlmtk09p6rncj',
  cognitoDomain: 'https://us-east-17axlypwa5.auth.us-east-1.amazoncognito.com',
  redirectUrl: 'http://localhost:5050/callback',
  postLogoutRedirectUri: 'http://localhost:5050/logout',
  scope: 'openid email profile',
  responseType: 'code'
} as const;

export const environment = {
  production: false,
  apiUrl: readEnv('NG_APP_API_URL', defaultApiUrl),
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
      authority: readEnv('NG_APP_COGNITO_AUTHORITY', defaultOidcConfig.authority),
      clientId: readEnv('NG_APP_COGNITO_CLIENT_ID', defaultOidcConfig.clientId),
      cognitoDomain: readEnv('NG_APP_COGNITO_DOMAIN', defaultOidcConfig.cognitoDomain),
      redirectUrl: readEnv('NG_APP_COGNITO_REDIRECT_URL', defaultOidcConfig.redirectUrl),
      postLogoutRedirectUri: readEnv(
        'NG_APP_COGNITO_LOGOUT_REDIRECT',
        defaultOidcConfig.postLogoutRedirectUri
      ),
      scope: readEnv('NG_APP_COGNITO_SCOPE', defaultOidcConfig.scope),
      responseType: readEnv('NG_APP_COGNITO_RESPONSE_TYPE', defaultOidcConfig.responseType)
    },
    identityProviders: {
      google: 'Google',
      microsoft: 'AzureSAML'
    }
  }
};
