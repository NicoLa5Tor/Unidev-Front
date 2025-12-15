import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptLoaderService } from '../../services/script-loader.service';

export interface SocialLoginProvider {
  key: string;
  name: string;
  description: string;
  icon?: string;
  avatarUrl?: string;
  ctaIntro?: string;
  ctaDetail?: string;
}

@Component({
  selector: 'app-social-login-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-login-list.component.html',
  styleUrl: './social-login-list.component.scss'
})
export class SocialLoginListComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) providers: SocialLoginProvider[] = [];
  @Output() providerSelected = new EventEmitter<SocialLoginProvider>();
  @Output() providerConfirmed = new EventEmitter<SocialLoginProvider>();

  @ViewChildren('listItem') listItems!: QueryList<ElementRef<HTMLLIElement>>;

  selectedKey: string | null = null;

  private cleanup: Array<() => void> = [];
  private flipPlugin: any;
  private lastFragments: Element[] = [];
  private lastIndex = -1;

  constructor(
    private readonly scriptLoader: ScriptLoaderService,
    private readonly ngZone: NgZone
  ) {}

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    await this.loadScripts();
    this.ngZone.runOutsideAngular(() => this.setupListeners());
  }

  ngOnDestroy(): void {
    this.cleanup.forEach(dispose => dispose());
    this.cleanup = [];
  }

  selectProvider(provider: SocialLoginProvider, index: number): void {
    if (!this.flipPlugin) {
      return;
    }

    const items = this.listItems.toArray().map(item => item.nativeElement as HTMLLIElement);
    const fragments = items.flatMap(item => Array.from(item.querySelectorAll<HTMLElement>('*')));
    const baseTargets: Element[] = items.map(item => item);
    const isSameAsLast = this.lastIndex === index && this.selectedKey === provider.key;
    const listContainer = items[0]?.parentElement as HTMLElement | undefined;
    const initialContainerHeight = listContainer?.offsetHeight ?? null;
    if (listContainer && initialContainerHeight) {
      listContainer.style.minHeight = `${initialContainerHeight}px`;
    }

    const targets = isSameAsLast
      ? baseTargets.concat(fragments)
      : baseTargets.concat(fragments, this.lastFragments);
    const state = this.flipPlugin.getState(targets);

    const scrollTarget = isSameAsLast ? null : items[index];

    if (isSameAsLast) {
      this.selectedKey = null;
      this.lastFragments = [];
      this.lastIndex = -1;
      items.forEach(item => item.classList.remove('expanded'));
    } else {
      this.selectedKey = provider.key;
      this.providerSelected.emit(provider);
      this.lastFragments = fragments;
      this.lastIndex = index;
      items.forEach((item, idx) => item.classList.toggle('expanded', idx === index));
    }

    this.flipPlugin.from(state, {
      duration: 0.5,
      ease: 'power1.inOut',
      nested: true,
      absolute: true,
      onComplete: () => {
        if (listContainer) {
          listContainer.style.minHeight = '';
        }
        if (scrollTarget) {
          this.ensureVisibility(scrollTarget);
        }
      }
    });
  }

  private async loadScripts(): Promise<void> {
    await this.scriptLoader.load('gsap', 'https://unpkg.com/gsap@3/dist/gsap.min.js');
    await this.scriptLoader.load('flip', 'https://unpkg.com/gsap@3/dist/Flip.min.js');
    this.flipPlugin = (window as any).Flip;
    const gsapInstance = (window as any).gsap;
    if (gsapInstance && this.flipPlugin) {
      gsapInstance.registerPlugin(this.flipPlugin);
    }
  }

  private setupListeners(): void {
    this.cleanup.forEach(dispose => dispose());
    this.cleanup = [];

    this.listItems.forEach((itemRef, index) => {
      const handler = () => {
        const provider = this.providers[index];
        this.selectProvider(provider, index);
      };
      itemRef.nativeElement.addEventListener('click', handler);
      this.cleanup.push(() => itemRef.nativeElement.removeEventListener('click', handler));
    });
  }

  private ensureVisibility(target: HTMLElement | undefined): void {
    if (typeof window === 'undefined' || !target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const offsetGap = 32;

    if (rect.bottom > viewportHeight - offsetGap) {
      const delta = rect.bottom - viewportHeight + offsetGap;
      window.scrollBy({ top: delta, behavior: 'smooth' });
    }
  }
}
