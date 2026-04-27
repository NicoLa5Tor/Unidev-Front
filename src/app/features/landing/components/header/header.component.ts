import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';

interface HeaderNavItem {
  label: string;
  route: string;
  fragment?: string;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnDestroy {
  isMenuOpen = false;

  readonly navItems: HeaderNavItem[] = [
    { label: 'Inicio', route: '/', fragment: 'home' },
    { label: 'Pricing', route: '/pricing' },
    { label: 'Empresas', route: '/companies' },
    { label: 'Universidades', route: '/universities' },
    { label: 'Contacto', route: '/contact' }
  ];

  private currentPath = '/';
  private currentFragment: string | null = null;
  private readonly routerSubscription: Subscription;

  constructor(private readonly router: Router) {
    this.syncActiveState(this.router.url);
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.syncActiveState((event as NavigationEnd).urlAfterRedirects);
        this.closeMenu();
      });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigate(item: HeaderNavItem): void {
    void this.router.navigate([item.route], {
      fragment: item.fragment
    });
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  isActive(item: HeaderNavItem): boolean {
    if (item.route === '/' && item.fragment) {
      if (this.currentPath !== '/') {
        return false;
      }

      if (item.fragment === 'home') {
        return !this.currentFragment || this.currentFragment === 'home';
      }

      return this.currentFragment === item.fragment;
    }

    return this.currentPath === item.route;
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  private syncActiveState(url: string): void {
    const [path, fragment] = url.split('#');
    this.currentPath = path || '/';
    this.currentFragment = fragment ?? null;
  }
}
