import { Amplify } from 'aws-amplify';
import type { ResourcesConfig } from '@aws-amplify/core';
import { environment } from '../../../environments/environment';

let isAmplifyConfigured = false;

export function initializeAmplify(): void {
  if (isAmplifyConfigured) {
    return;
  }

  Amplify.configure(environment.auth.amplify as ResourcesConfig);

  isAmplifyConfigured = true;
}
