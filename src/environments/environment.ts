import { readEnv } from './env.utils';

const apiUrl = readEnv('NG_APP_API_URL');
const oidcAuthority = readEnv('NG_APP_COGNITO_AUTHORITY');
const oidcClientId = readEnv('NG_APP_COGNITO_CLIENT_ID');
const oidcDomain = readEnv('NG_APP_COGNITO_DOMAIN');
const oidcRedirect = readEnv('NG_APP_COGNITO_REDIRECT_URL');
const oidcLogoutRedirect = readEnv('NG_APP_COGNITO_LOGOUT_REDIRECT');
const oidcScope = readEnv('NG_APP_COGNITO_SCOPE');
const oidcResponseType = readEnv('NG_APP_COGNITO_RESPONSE_TYPE');

export const environment = {
  production: false,
  apiUrl,
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
      authority: oidcAuthority,
      clientId: oidcClientId,
      cognitoDomain: oidcDomain,
      redirectUrl: oidcRedirect,
      postLogoutRedirectUri: oidcLogoutRedirect,
      scope: oidcScope,
      responseType: oidcResponseType
    },
    identityProviders: {
      google: 'Google',
      microsoft: 'AzureSAML'
    }
  }
};
