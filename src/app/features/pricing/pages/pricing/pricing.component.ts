import { Component, ElementRef, Inject, OnDestroy, AfterViewInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent implements AfterViewInit, OnDestroy {
  private observer?: ResizeObserver;
  private pointerHandler?: (event: PointerEvent) => void;

  constructor(
    private readonly elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const cardsContainer = this.elementRef.nativeElement.querySelector('.cards') as HTMLElement | null;
    const overlay = this.elementRef.nativeElement.querySelector('.overlay') as HTMLElement | null;
    const cards = Array.from(this.elementRef.nativeElement.querySelectorAll('.card')) as HTMLElement[];

    if (!cardsContainer || !overlay || cards.length === 0) {
      return;
    }

    const createOverlayCta = (overlayCard: HTMLElement, ctaEl: Element | null): void => {
      if (!ctaEl) {
        return;
      }
      const overlayCta = this.document.createElement('div');
      overlayCta.classList.add('cta');
      overlayCta.textContent = ctaEl.textContent ?? '';
      overlayCta.setAttribute('aria-hidden', 'true');
      overlayCard.append(overlayCta);
    };

    const initOverlayCard = (cardEl: HTMLElement): void => {
      const overlayCard = this.document.createElement('div');
      overlayCard.classList.add('card');
      createOverlayCta(overlayCard, cardEl.lastElementChild);
      overlay.append(overlayCard);
    };

    cards.forEach(initOverlayCard);

    this.observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const cardIndex = cards.indexOf(entry.target as HTMLElement);
        const size = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;
        if (cardIndex >= 0 && overlay.children[cardIndex]) {
          (overlay.children[cardIndex] as HTMLElement).style.width = `${size.inlineSize}px`;
          (overlay.children[cardIndex] as HTMLElement).style.height = `${size.blockSize}px`;
        }
      });
    });

    cards.forEach(card => this.observer?.observe(card));

    this.pointerHandler = (event: PointerEvent) => {
      const rect = cardsContainer.getBoundingClientRect();
      const x = event.pageX - rect.left - this.document.documentElement.scrollLeft;
      const y = event.pageY - rect.top - this.document.documentElement.scrollTop;
      overlay.style.setProperty('--opacity', '1');
      overlay.style.setProperty('--x', `${x}px`);
      overlay.style.setProperty('--y', `${y}px`);
    };

    this.document.body.addEventListener('pointermove', this.pointerHandler);
  }

  ngOnDestroy(): void {
    if (this.pointerHandler) {
      this.document.body.removeEventListener('pointermove', this.pointerHandler);
    }
    this.observer?.disconnect();
  }
}
