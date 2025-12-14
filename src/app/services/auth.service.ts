import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface FederatedSession {
  identityId: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration?: Date;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly azureConfig = environment.auth.azure;
  private readonly identityConfig = environment.auth.identityPool;
  private readonly storageKey = 'unidev:id_token';
  private awsSdkPromise: Promise<typeof import('aws-sdk')> | null = null;

  private readonly credentialsSubject = new BehaviorSubject<FederatedSession | null>(null);
  readonly credentials$ = this.credentialsSubject.asObservable();
  readonly isAuthenticated$ = this.credentials$.pipe(map(credentials => !!credentials));

  constructor() {
    if (this.isBrowser()) {
      void this.resumeSession();
    }
  }

  redirectToMicrosoft(): void {
    if (!this.isBrowser()) {
      return;
    }

    const params = new URLSearchParams({
      client_id: this.azureConfig.clientId,
      response_type: 'id_token',
      redirect_uri: this.azureConfig.redirectUri,
      scope: this.azureConfig.scope,
      response_mode: this.azureConfig.responseMode,
      nonce: this.azureConfig.nonce
    });

    const authorizeUrl = `${this.azureConfig.authorizeEndpoint}?${params.toString()}`;
    window.location.href = authorizeUrl;
  }

  async federateWithAzure(idToken: string): Promise<FederatedSession> {
    if (!idToken) {
      throw new Error('No se recibió un id_token para federar la sesión.');
    }

    this.persistIdToken(idToken);
    const AWS = await this.loadAwsSdk();

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.identityConfig.identityPoolId,
      Logins: {
        [this.identityConfig.loginKey]: idToken
      }
    });

    await this.refreshCredentials(AWS);

    const credentials = AWS.config.credentials as AWS.Credentials & { identityId?: string };
    if (!credentials || !credentials.accessKeyId || !credentials.secretAccessKey) {
      throw new Error('No se pudieron obtener credenciales temporales de AWS.');
    }

    const session: FederatedSession = {
      identityId: credentials.identityId ?? '',
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken ?? '',
      expiration: credentials.expireTime ?? undefined
    };

    this.credentialsSubject.next(session);
    return session;
  }

  logout(): void {
    this.persistIdToken(null);
    this.credentialsSubject.next(null);
    void this.loadAwsSdk().then(AWS => {
      AWS.config.credentials = undefined;
    });
  }

  getToken(): Promise<string | null> {
    return Promise.resolve(this.readIdToken());
  }

  ensureAuthenticated(): Observable<boolean> {
    return from(this.resumeSession());
  }

  private async resumeSession(): Promise<boolean> {
    if (!this.isBrowser()) {
      return false;
    }

    if (this.credentialsSubject.value) {
      return true;
    }

    const cachedToken = this.readIdToken();
    if (!cachedToken) {
      return false;
    }

    try {
      await this.federateWithAzure(cachedToken);
      return true;
    } catch (error) {
      console.error('No se pudo restaurar la sesión federada', error);
      this.persistIdToken(null);
      this.credentialsSubject.next(null);
      return false;
    }
  }

  private refreshCredentials(AWS: typeof import('aws-sdk')): Promise<void> {
    return new Promise((resolve, reject) => {
      const credentials = AWS.config.credentials as AWS.Credentials | undefined;
      if (!credentials || typeof credentials.get !== 'function') {
        reject(new Error('No fue posible inicializar las credenciales federadas.'));
        return;
      }

      credentials.get((error: AWS.AWSError | undefined) => {
        if (error) {
          reject(new Error(`Error en la federación con el Identity Pool: ${error.message}`));
          return;
        }

        resolve();
      });
    });
  }

  private loadAwsSdk(): Promise<typeof import('aws-sdk')> {
    if (!this.awsSdkPromise) {
      this.awsSdkPromise = import('aws-sdk').then(module => {
        module.config.region = this.identityConfig.region;
        return module;
      });
    }

    return this.awsSdkPromise;
  }

  private persistIdToken(token: string | null): void {
    if (!this.isBrowser()) {
      return;
    }

    if (!token) {
      window.localStorage.removeItem(this.storageKey);
      return;
    }

    window.localStorage.setItem(this.storageKey, token);
  }

  private readIdToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }

    return window.localStorage.getItem(this.storageKey);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }
}
