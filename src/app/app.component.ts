import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
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
  private readonly defaultTitle = 'UniDev | Talento, proyectos y mentorias';
  private readonly defaultDescription =
    'UniDev conecta talento, proyectos y mentorias en una sola plataforma para estudiantes, empresas y equipos.';

  protected readonly unicornConfig = environment.unicornEmbed;
  showPublicHeader = false;

  constructor(
    private readonly themeService: ThemeService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly title: Title,
    private readonly meta: Meta
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
    this.syncSeoState(route);
  }

  private syncSeoState(route: ActivatedRoute): void {
    const pageTitle = route.snapshot.title ?? this.defaultTitle;
    const description = route.snapshot.data['description'] ?? this.defaultDescription;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
