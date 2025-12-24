import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type ThemeName = 'cyber' | 'light' | 'abyss';

const THEME_STORAGE_KEY = 'unidev-theme';
const THEME_CLASS_PREFIX = 'theme-';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeSubject = new BehaviorSubject<ThemeName>('cyber');
  readonly theme$ = this.themeSubject.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeName | null;
      const theme = stored ?? 'cyber';
      this.applyTheme(theme);
      this.themeSubject.next(theme);
    }
  }

  get theme(): ThemeName {
    return this.themeSubject.value;
  }

  setTheme(theme: ThemeName): void {
    if (theme === this.themeSubject.value) {
      return;
    }
    this.applyTheme(theme);
    if (isPlatformBrowser(this.platformId)) {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    this.themeSubject.next(theme);
  }

  private applyTheme(theme: ThemeName): void {
    const body = this.document?.body;
    if (!body) {
      return;
    }
    body.classList.forEach(className => {
      if (className.startsWith(THEME_CLASS_PREFIX)) {
        body.classList.remove(className);
      }
    });
    body.classList.add(`${THEME_CLASS_PREFIX}${theme}`);
  }
}
