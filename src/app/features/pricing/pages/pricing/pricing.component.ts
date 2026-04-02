import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  QueryList,
  ViewChildren,
  inject
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScriptLoaderService } from '../../../../shared/services/script-loader.service';

type PricingPlan = {
  kicker: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  note: string;
  accent: 'teal' | 'violet' | 'rose';
  featured?: boolean;
};

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cardsContainer') private cardsContainerRef?: ElementRef<HTMLElement>;
  @ViewChild('overlay') private overlayRef?: ElementRef<HTMLElement>;
  @ViewChildren('pricingCard') private pricingCards!: QueryList<ElementRef<HTMLElement>>;

  readonly plans: PricingPlan[] = [
    {
      kicker: 'Starter',
      name: 'Talent',
      price: '$9',
      period: 'USD / mes',
      description: 'Para estudiantes y perfiles junior que quieren entrar a retos reales con estructura clara.',
      features: [
        'Perfil profesional y portafolio validable',
        'Acceso a retos activos y postulaciones guiadas',
        'Seguimiento básico de avance y entregables'
      ],
      cta: 'Empezar ahora',
      href: '#talent',
      note: 'Ideal para comenzar y construir historial.',
      accent: 'teal'
    },
    {
      kicker: 'Featured',
      name: 'Studio',
      price: '$29',
      period: 'USD / mes',
      description: 'Para equipos pequeños y células de mentoría que necesitan coordinar trabajo, feedback y progreso.',
      features: [
        'Panel colaborativo con revisión por hitos',
        'Mentorías 1:1 y trazabilidad de feedback',
        'Gestión de cohortes, roles y entregas'
      ],
      cta: 'Elegir Studio',
      href: '#studio',
      note: 'La opción más equilibrada para operación real.',
      accent: 'violet',
      featured: true
    },
    {
      kicker: 'Scale',
      name: 'Campus',
      price: '$79',
      period: 'USD / mes',
      description: 'Para universidades, laboratorios y partners que quieren desplegar UniDev con más control y visibilidad.',
      features: [
        'Espacios multi-equipo y reportes ejecutivos',
        'Integraciones, branding y flujos institucionales',
        'Acompañamiento de onboarding prioritario'
      ],
      cta: 'Hablar con ventas',
      href: '#campus',
      note: 'Pensado para despliegues de mayor escala.',
      accent: 'rose'
    }
  ];

  private readonly scriptLoader = inject(ScriptLoaderService);
  private readonly platformId = inject(PLATFORM_ID);

  private gsapInstance: any;
  private pointerHandler?: (event: PointerEvent) => void;
  private pointerLeaveHandler?: () => void;
  private cleanup: Array<() => void> = [];
  private setupFrameId?: number;

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.loadGsap();
    if (!this.gsapInstance) {
      return;
    }

    this.setupFrameId = window.requestAnimationFrame(() => {
      this.runEntranceAnimation();
      this.setupOverlayInteraction();
    });
  }

  ngOnDestroy(): void {
    this.cleanup.forEach(dispose => dispose());
    this.cleanup = [];
    if (this.setupFrameId) {
      window.cancelAnimationFrame(this.setupFrameId);
    }
  }

  private async loadGsap(): Promise<void> {
    await this.scriptLoader.load('gsap', 'https://unpkg.com/gsap@3/dist/gsap.min.js');
    this.gsapInstance = (window as any).gsap;
  }

  private runEntranceAnimation(): void {
    const cards = this.pricingCards.toArray().map(card => card.nativeElement);
    if (cards.length === 0) {
      return;
    }

    this.gsapInstance.from(cards, {
      y: 48,
      autoAlpha: 0,
      rotateX: -8,
      transformPerspective: 1200,
      duration: 0.82,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'opacity,visibility'
    });
  }

  private setupOverlayInteraction(): void {
    const cardsContainer = this.cardsContainerRef?.nativeElement ?? null;
    const overlay = this.overlayRef?.nativeElement ?? null;
    if (!cardsContainer || !overlay) {
      return;
    }

    overlay.style.setProperty('--opacity', '0');

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
  }
}
