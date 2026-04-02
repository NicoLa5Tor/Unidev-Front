import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren,
  inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { CompanyService } from '../../../companies/services/company.service';
import { Plan } from '../../../../shared/models/company.model';

type PricingPlan = {
  id: number;
  kicker: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  accent: 'teal' | 'violet' | 'rose';
};

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cardsContainer') private cardsContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('overlay') private overlayRef?: ElementRef<HTMLElement>;
  @ViewChildren('pricingCard') private pricingCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('overlayCard') private overlayCards!: QueryList<ElementRef<HTMLElement>>;

  plans: PricingPlan[] = [];

  private readonly platformId = inject(PLATFORM_ID);
  private readonly companyService = inject(CompanyService);

  private observer?: ResizeObserver;
  private pointerHandler?: (event: PointerEvent) => void;
  private pointerLeaveHandler?: () => void;
  private viewInitialized = false;
  private cleanup: Array<() => void> = [];
  private setupFrameId?: number;
  private syncTimeoutId?: number;

  ngOnInit(): void {
    this.loadPlans();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.scheduleOverlaySetup();
  }

  ngOnDestroy(): void {
    this.teardownOverlayInteraction();
    if (this.setupFrameId) {
      window.cancelAnimationFrame(this.setupFrameId);
    }
  }

  private loadPlans(): void {
    this.companyService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans
          .filter((plan) => plan.active)
          .sort((left, right) => left.displayOrder - right.displayOrder)
          .map((plan, index) => this.toPricingPlan(plan, index));
        this.scheduleOverlaySetup();
      },
      error: () => {
        this.plans = [];
      }
    });
  }

  private toPricingPlan(plan: Plan, index: number): PricingPlan {
    const accents: Array<PricingPlan['accent']> = ['teal', 'violet', 'rose'];
    return {
      id: plan.id,
      kicker: this.buildKicker(plan, index),
      name: plan.name,
      price: this.formatPrice(plan.priceAmount),
      period: 'USD / mes',
      description: plan.description,
      features: this.buildFeatures(plan),
      cta: 'Comprar plan',
      href: '/companies',
      accent: accents[index % accents.length]
    };
  }

  private buildKicker(plan: Plan, index: number): string {
    if (plan.code === 'SCALE_UNLIMITED') {
      return 'Scale';
    }
    if (index === 1) {
      return 'Featured';
    }
    return 'Starter';
  }

  private buildFeatures(plan: Plan): string[] {
    if (plan.accessMode === 'DOMAIN_WIDE') {
      return [
        'Acceso por dominio institucional aprobado',
        'Usuarios ilimitados dentro de la organizacion',
        'Ideal para empresas, universidades y operaciones amplias'
      ];
    }

    return [
      plan.maxUsers ? `Hasta ${plan.maxUsers} usuarios autorizados` : 'Usuarios administrados por el owner',
      'Gestion centralizada por el owner del grupo',
      'Altas y bajas de miembros segun el plan activo'
    ];
  }

  private formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }

  private scheduleOverlaySetup(): void {
    if (!this.viewInitialized || !isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.setupFrameId) {
      window.cancelAnimationFrame(this.setupFrameId);
    }

    this.setupFrameId = window.requestAnimationFrame(() => {
      this.teardownOverlayInteraction();
      this.setupOverlayInteraction();
    });
  }

  private teardownOverlayInteraction(): void {
    this.cleanup.forEach((dispose) => dispose());
    this.cleanup = [];
    this.observer?.disconnect();
    this.observer = undefined;
    if (this.syncTimeoutId) {
      window.clearTimeout(this.syncTimeoutId);
      this.syncTimeoutId = undefined;
    }
  }

  private setupOverlayInteraction(): void {
    const cards = this.pricingCards.toArray().map((card) => card.nativeElement);
    const overlayCards = this.overlayCards.toArray().map((card) => card.nativeElement);
    const cardsContainer = this.cardsContainerRef?.nativeElement ?? null;
    const overlay = this.overlayRef?.nativeElement ?? null;

    if (!cardsContainer || !overlay || cards.length === 0 || cards.length !== overlayCards.length) {
      return;
    }

    overlay.style.setProperty('--opacity', '0');
    this.syncAllOverlayCardSizes(cards, overlayCards);

    this.observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const cardIndex = cards.indexOf(entry.target as HTMLElement);
        const overlayCard = overlayCards[cardIndex];
        if (!overlayCard) {
          return;
        }

        const size = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;
        if (size?.inlineSize && size?.blockSize) {
          overlayCard.style.width = `${size.inlineSize}px`;
          overlayCard.style.height = `${size.blockSize}px`;
          return;
        }

        this.syncOverlayCardSize(entry.target as HTMLElement, overlayCard);
      });
    });

    cards.forEach((card) => this.observer?.observe(card));

    this.pointerHandler = (event: PointerEvent) => {
      const rect = cardsContainer.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      overlay.style.setProperty('--opacity', '1');
      overlay.style.setProperty('--x', `${x}px`);
      overlay.style.setProperty('--y', `${y}px`);
    };

    this.pointerLeaveHandler = () => {
      overlay.style.setProperty('--opacity', '0');
    };

    cardsContainer.addEventListener('pointerenter', this.pointerHandler);
    cardsContainer.addEventListener('pointermove', this.pointerHandler);
    cardsContainer.addEventListener('pointerleave', this.pointerLeaveHandler);

    this.cleanup.push(() => {
      cardsContainer.removeEventListener('pointerenter', this.pointerHandler!);
      cardsContainer.removeEventListener('pointermove', this.pointerHandler!);
      cardsContainer.removeEventListener('pointerleave', this.pointerLeaveHandler!);
    });

    window.requestAnimationFrame(() => this.syncAllOverlayCardSizes(cards, overlayCards));
    this.syncTimeoutId = window.setTimeout(() => this.syncAllOverlayCardSizes(cards, overlayCards), 120);
  }

  private syncOverlayCardSize(cardEl: HTMLElement, overlayCard: HTMLElement): void {
    const rect = cardEl.getBoundingClientRect();
    overlayCard.style.width = `${rect.width}px`;
    overlayCard.style.height = `${rect.height}px`;
  }

  private syncAllOverlayCardSizes(cards: HTMLElement[], overlayCards: HTMLElement[]): void {
    cards.forEach((card, index) => {
      const overlayCard = overlayCards[index];
      if (overlayCard) {
        this.syncOverlayCardSize(card, overlayCard);
      }
    });
  }
}
