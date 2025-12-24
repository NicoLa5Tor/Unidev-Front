import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { environment } from '../environments/environment';
import { UnicornBackgroundComponent } from './shared/layout/unicorn-background/unicorn-background.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UnicornBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly unicornConfig = environment.unicornEmbed;

  constructor(private readonly themeService: ThemeService) {}
}
