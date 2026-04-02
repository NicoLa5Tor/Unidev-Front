import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { BlackbirdExperience, BlackbirdExperienceDeps } from '../../../../shared/effects/blackbird-experience';
import { HeroFeaturesSectionComponent } from '../../../landing/components/hero/sections/hero-features-section/hero-features-section.component';
import { HeroFinalCtaSectionComponent } from '../../../landing/components/hero/sections/hero-final-cta-section/hero-final-cta-section.component';
import { HeroIntroSectionComponent } from '../../../landing/components/hero/sections/hero-intro-section/hero-intro-section.component';
import { HeroStepsSectionComponent } from '../../../landing/components/hero/sections/hero-steps-section/hero-steps-section.component';

@Component({
  selector: 'app-blackbird-experience',
  standalone: true,
  imports: [
    CommonModule,
    HeroIntroSectionComponent,
    HeroFeaturesSectionComponent,
    HeroStepsSectionComponent,
    HeroFinalCtaSectionComponent
  ],
  templateUrl: './blackbird-experience.component.html',
  styleUrl: './blackbird-experience.component.scss'
})
export class BlackbirdExperienceComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('threeContainer', { static: true }) private threeContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('contentRoot', { static: true }) private contentRoot?: ElementRef<HTMLElement>;

  isReady = false;
  stats = [
    { number: '500+', label: 'Proyectos Activos', icon: '⚡' },
    { number: '1000+', label: 'Estudiantes', icon: '🎓' },
    { number: '200+', label: 'Empresas', icon: '🏢' },
    { number: '95%', label: 'Satisfacción', icon: '⭐' }
  ];

  features = [
    {
      icon: '🚀',
      title: 'Proyectos Reales',
      description: 'Trabaja en proyectos auténticos de empresas establecidas, no simulaciones académicas.'
    },
    {
      icon: '💰',
      title: 'Compensación Justa',
      description: 'Recibe pago por tu trabajo mientras adquieres experiencia valiosa en el mercado laboral.'
    },
    {
      icon: '🎯',
      title: 'Mentorías Profesionales',
      description: 'Aprende de expertos de la industria que te guían en cada paso de tu desarrollo.'
    },
    {
      icon: '🏆',
      title: 'Certificaciones',
      description: 'Obtén certificados verificables que respalden tus habilidades ante futuros empleadores.'
    },
    {
      icon: '🤝',
      title: 'Networking',
      description: 'Conecta con profesionales, empresarios y otros estudiantes talentosos de tu área.'
    },
    {
      icon: '📈',
      title: 'Crecimiento Acelerado',
      description: 'Desarrolla habilidades técnicas y blandas más rápido que en métodos tradicionales.'
    }
  ];

  readonly typewriterTexts = [
    'Proyectos Reales',
    'Experiencia Práctica',
    'Crecimiento Profesional',
    'Oportunidades Únicas'
  ];

  steps = [
    {
      title: 'Regístrate y Crea tu Perfil',
      description: 'Completa tu perfil destacando tus habilidades, intereses y proyectos académicos.'
    },
    {
      title: 'Explora Proyectos Disponibles',
      description: 'Navega por cientos de proyectos de empresas reales que buscan talento universitario.'
    },
    {
      title: 'Aplica y Comienza a Trabajar',
      description: 'Postúlate a proyectos que te interesen y empieza a construir tu experiencia profesional.'
    }
  ];

  readonly currentYear = new Date().getFullYear();

  private animationFrameId?: number;
  private scriptsLoaded = false;
  private experience?: BlackbirdExperience;
  private gsapContext?: { revert: () => void };
  private magneticCleanups: Array<() => void> = [];

  ngOnInit(): void {
    this.toggleBodyScroll(true);
  }

  async ngAfterViewInit(): Promise<void> {
    await this.loadRequiredScripts();
    this.startExperience();
  }

  ngOnDestroy(): void {
    this.cleanupLandingAnimations();
    cancelAnimationFrame(this.animationFrameId ?? 0);
    this.experience?.dispose();
    this.toggleBodyScroll(false);
  }

  private async loadRequiredScripts(): Promise<void> {
    if (this.scriptsLoaded) {
      return;
    }

    const scriptUrls = [
      'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
      'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
      'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollSmoother.min.js',
      'https://unpkg.com/three@0.139.2/build/three.min.js',
      'https://unpkg.com/three@0.139.2/examples/js/controls/OrbitControls.js'
    ];

    for (const url of scriptUrls) {
      await this.injectScript(url);
    }

    this.scriptsLoaded = true;
  }

  private injectScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`No fue posible cargar ${src}`));
      document.body.appendChild(script);
    });
  }

  private startExperience(): void {
    const container = this.threeContainer?.nativeElement;
    const contentElement = this.contentRoot?.nativeElement;
    if (!container || !contentElement) {
      return;
    }

    const globals = window as any;
    const THREE = globals.THREE;
    const gsap = globals.gsap;
    const ScrollTrigger = globals.ScrollTrigger;
    const ScrollSmoother = globals.ScrollSmoother;

    if (!THREE || !gsap || !ScrollTrigger || !ScrollSmoother) {
      console.error('No fue posible inicializar la experiencia: faltan dependencias.');
      return;
    }

    const deps: BlackbirdExperienceDeps = {
      container,
      contentElement,
      THREE,
      gsap,
      ScrollTrigger,
      ScrollSmoother,
      requestFrame: (callback: FrameRequestCallback) => {
        this.animationFrameId = requestAnimationFrame(callback);
        return this.animationFrameId;
      },
      onReady: () => this.handleExperienceReady()
    };

    this.experience = new BlackbirdExperience(deps);
  }

  private handleExperienceReady(): void {
    this.isReady = true;
    this.toggleBodyScroll(false);
    this.initLandingAnimations();
  }

  private toggleBodyScroll(lock: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.classList.toggle('preloader-active', lock);
  }

  private initLandingAnimations(): void {
    const contentElement = this.contentRoot?.nativeElement;
    const globals = window as any;
    const gsap = globals.gsap;
    const ScrollTrigger = globals.ScrollTrigger;

    if (!contentElement || !gsap || !ScrollTrigger) {
      console.warn('No fue posible inicializar las animaciones de la landing.');
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.gsapContext = gsap.context(() => {
      this.setupHeroReveal(gsap, ScrollTrigger, contentElement, prefersReducedMotion);
      this.setupAmbientMotion(gsap, contentElement, prefersReducedMotion);
      this.setupStatCounters(gsap, ScrollTrigger, contentElement, prefersReducedMotion);
      this.setupMagneticButtons(gsap, contentElement, prefersReducedMotion);
      this.setupFinalCtaSpotlight(gsap, contentElement, prefersReducedMotion);
    }, contentElement);

    window.setTimeout(() => ScrollTrigger.refresh(), 150);
  }

  private cleanupLandingAnimations(): void {
    this.magneticCleanups.forEach((cleanup) => cleanup());
    this.magneticCleanups = [];
    this.gsapContext?.revert();
    this.gsapContext = undefined;
  }

  private setupHeroReveal(gsap: any, ScrollTrigger: any, root: HTMLElement, reducedMotion: boolean): void {
    const hero = root.querySelector('.hero-intro');
    if (!hero) {
      return;
    }

    const heroTimeline = gsap.timeline({
      defaults: {
        ease: 'power3.out',
        force3D: true
      }
    });

    heroTimeline
      .from('.hero-badge', {
        y: reducedMotion ? 0 : 22,
        opacity: 0,
        duration: 0.6
      })
      .from(
        '.hero-title',
        {
          y: reducedMotion ? 0 : 48,
          opacity: 0,
          duration: 0.9
        },
        '-=0.2'
      )
      .from(
        '.hero-subtitle',
        {
          y: reducedMotion ? 0 : 32,
          opacity: 0,
          duration: 0.7
        },
        '-=0.45'
      )
      .from(
        '.hero-copy',
        {
          y: reducedMotion ? 0 : 28,
          opacity: 0,
          duration: 0.65
        },
        '-=0.35'
      )
      .from(
        '.hero-pill',
        {
          y: reducedMotion ? 0 : 22,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08
        },
        '-=0.25'
      )
      .from(
        '.hero-actions .btn-theme',
        {
          y: reducedMotion ? 0 : 24,
          opacity: 0,
          duration: 0.55,
          stagger: 0.1
        },
        '-=0.3'
      )
      .from(
        '.hero-stat',
        {
          y: reducedMotion ? 0 : 28,
          opacity: 0,
          rotateX: reducedMotion ? 0 : -10,
          transformOrigin: '50% 100%',
          duration: 0.6,
          stagger: 0.08
        },
        '-=0.15'
      )
      .from(
        '.hero-scroll-cue',
        {
          y: reducedMotion ? 0 : 16,
          opacity: 0,
          duration: 0.45
        },
        '-=0.25'
      );

    if (reducedMotion) {
      return;
    }
  }

  private setupAmbientMotion(gsap: any, root: HTMLElement, reducedMotion: boolean): void {
    if (reducedMotion) {
      return;
    }

    const floatingElements = Array.from(root.querySelectorAll('.floating-blob, .ambient-orb'));
    floatingElements.forEach((element, index) => {
      gsap.to(element, {
        x: index % 2 === 0 ? 22 : -18,
        y: index % 2 === 0 ? -26 : 20,
        rotate: index % 2 === 0 ? 6 : -5,
        scale: index % 2 === 0 ? 1.08 : 0.94,
        duration: 7 + index * 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    gsap.to('.hero-scroll-cue__line', {
      y: 14,
      opacity: 0.25,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
  }

  private setupStatCounters(gsap: any, ScrollTrigger: any, root: HTMLElement, reducedMotion: boolean): void {
    const counters = Array.from(root.querySelectorAll<HTMLElement>('.stat-card__number'));

    counters.forEach((counter) => {
      const rawValue = counter.dataset['value']?.trim() ?? counter.textContent?.trim() ?? '';
      const match = rawValue.match(/^(\d+)(.*)$/);
      if (!match) {
        return;
      }

      const targetValue = Number(match[1]);
      const suffix = match[2] ?? '';
      const state = { value: 0 };
      counter.textContent = `0${suffix}`;

      ScrollTrigger.create({
        trigger: counter,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.to(state, {
            value: targetValue,
            duration: reducedMotion ? 0.01 : 1.6,
            ease: 'power2.out',
            snap: { value: 1 },
            onUpdate: () => {
              counter.textContent = `${Math.round(state.value)}${suffix}`;
            }
          });
        }
      });
    });
  }

  private setupMagneticButtons(gsap: any, root: HTMLElement, reducedMotion: boolean): void {
    if (reducedMotion) {
      return;
    }

    const buttons = Array.from(root.querySelectorAll<HTMLElement>('.btn-theme[data-magnetic]'));
    buttons.forEach((button) => {
      const xTo = gsap.quickTo(button, 'x', { duration: 0.35, ease: 'power3.out' });
      const yTo = gsap.quickTo(button, 'y', { duration: 0.35, ease: 'power3.out' });
      const rotateTo = gsap.quickTo(button, 'rotate', { duration: 0.45, ease: 'power3.out' });
      const shine = button.querySelector<HTMLElement>('.btn-theme__shine');
      const shineX = shine ? gsap.quickTo(shine, 'xPercent', { duration: 0.45, ease: 'power3.out' }) : null;

      const handleMove = (event: PointerEvent) => {
        const rect = button.getBoundingClientRect();
        const offsetX = event.clientX - rect.left - rect.width / 2;
        const offsetY = event.clientY - rect.top - rect.height / 2;
        xTo(offsetX * 0.12);
        yTo(offsetY * 0.16);
        rotateTo(offsetX * 0.015);
        shineX?.((offsetX / rect.width) * 240);
      };

      const handleLeave = () => {
        xTo(0);
        yTo(0);
        rotateTo(0);
        shineX?.(0);
      };

      button.addEventListener('pointermove', handleMove);
      button.addEventListener('pointerleave', handleLeave);
      button.addEventListener('pointercancel', handleLeave);

      this.magneticCleanups.push(() => {
        button.removeEventListener('pointermove', handleMove);
        button.removeEventListener('pointerleave', handleLeave);
        button.removeEventListener('pointercancel', handleLeave);
      });
    });
  }

  private setupFinalCtaSpotlight(gsap: any, root: HTMLElement, reducedMotion: boolean): void {
    if (reducedMotion) {
      return;
    }

    const finalCta = root.querySelector<HTMLElement>('.cta-band__panel');
    if (!finalCta) {
      return;
    }

    const xTo = gsap.quickTo(finalCta, '--spotlight-x', {
      duration: 0.35,
      ease: 'power3.out'
    });
    const yTo = gsap.quickTo(finalCta, '--spotlight-y', {
      duration: 0.35,
      ease: 'power3.out'
    });
    const glowTo = gsap.quickTo(finalCta, '--spotlight-opacity', {
      duration: 0.35,
      ease: 'power2.out'
    });

    const handleMove = (event: PointerEvent) => {
      const rect = finalCta.getBoundingClientRect();
      xTo(event.clientX - rect.left);
      yTo(event.clientY - rect.top);
      glowTo(1);
    };

    const handleLeave = () => {
      xTo(finalCta.clientWidth / 2);
      yTo(finalCta.clientHeight / 2);
      glowTo(0.55);
    };

    finalCta.addEventListener('pointermove', handleMove);
    finalCta.addEventListener('pointerleave', handleLeave);
    finalCta.addEventListener('pointercancel', handleLeave);

    this.magneticCleanups.push(() => {
      finalCta.removeEventListener('pointermove', handleMove);
      finalCta.removeEventListener('pointerleave', handleLeave);
      finalCta.removeEventListener('pointercancel', handleLeave);
    });
  }
}
