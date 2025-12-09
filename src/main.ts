import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initializeAmplify } from './app/core/config/amplify.config';

initializeAmplify();

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
