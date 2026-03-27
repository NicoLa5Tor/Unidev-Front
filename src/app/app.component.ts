import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { environment } from '../environments/environment';
import { UnicornBackgroundComponent } from './shared/layout/unicorn-background/unicorn-background.component';
import { ThemeService } from './core/services/theme.service';
import { HeaderComponent } from './features/landing/components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, UnicornBackgroundComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly unicornConfig = environment.unicornEmbed;
  showPublicHeader = false;

  constructor(
    private readonly themeService: ThemeService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {
    this.syncLayoutState();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.syncLayoutState());
  }

  private syncLayoutState(): void {
    let route = this.activatedRoute;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.showPublicHeader = route.snapshot.data['publicHeader'] === true;
  }
}
