import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { initializeAmplify } from './app/core/config/amplify.config';

const bootstrap = () => {
  initializeAmplify();
  return bootstrapApplication(AppComponent, config);
};

export default bootstrap;
