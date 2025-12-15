import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptLoaderService } from '../../services/script-loader.service';

declare global {
  interface Window {
    gsap: any;
  }
}

@Component({
  selector: 'app-animated-paragraph',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #container class="text-block">
      <p [ngClass]="paragraphClass">{{ text }}</p>
    </div>
  `,
  styleUrl: './animated-paragraph.component.scss'
})
export class AnimatedParagraphComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) text = '';
  @Input() paragraphClass = 'text-3xl font-semibold text-white';

  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private animation: { kill: () => void } | null = null;

  constructor(
    private readonly scriptLoader: ScriptLoaderService,
    private readonly ngZone: NgZone
  ) {}

  async ngAfterViewInit(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    await this.scriptLoader.load('gsap', 'https://unpkg.com/gsap@3/dist/gsap.min.js');
    this.ngZone.runOutsideAngular(() => this.initMaskAnimation());
  }

  ngOnDestroy(): void {
    this.animation?.kill();
    this.animation = null;
  }

  private initMaskAnimation(): void {
    const container = this.containerRef.nativeElement;
    container.style.setProperty('--mask', 'linear-gradient(-45deg, transparent 100%, black 150%)');

    this.animation = window.gsap.to(container, {
      duration: 4,
      ease: 'sine.out',
      '--mask': 'linear-gradient(-45deg, transparent -50%, black 0%)'
    });
  }

}
