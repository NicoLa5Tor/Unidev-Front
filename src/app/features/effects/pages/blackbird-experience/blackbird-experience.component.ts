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
  isPreloaderVisible = true;
  isHeroTypewriterActive = false;
  features = [
    {
      icon: '🚀',
      eyebrow: 'Proyectos con contexto',
      titleLines: ['Proyectos', 'reales'],
      description: 'Trabaja sobre entregables que sí vienen de empresas, con fricción real, revisión real y decisiones que no parecen ejercicio de clase.',
      imageUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Equipo revisando entregables en una mesa de trabajo',
      accent: 'violet' as const,
      noteLabel: 'Modo',
      noteValue: 'Live brief'
    },
    {
      icon: '🎯',
      eyebrow: 'Acompañamiento experto',
      titleLines: ['Mentoría', 'activa'],
      description: 'Cada reto se mueve con criterio profesional: feedback en hitos, observaciones accionables y acompañamiento para no avanzar a ciegas.',
      imageUrl:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Mentores colaborando con estudiantes frente a un computador',
      accent: 'cyan' as const,
      noteLabel: 'Formato',
      noteValue: '1:1 + review'
    },
    {
      icon: '💰',
      eyebrow: 'Valor para ambos lados',
      titleLines: ['Compensa', 'justo'],
      description: 'No solo practicas. Construyes experiencia con valor visible, y en los casos adecuados puedes entrar a dinámicas reales de compensación y continuidad.',
      imageUrl:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Reunión de equipo con paneles y métricas de negocio',
      accent: 'rose' as const,
      noteLabel: 'Resultado',
      noteValue: 'Historial validable'
    },
    {
      icon: '🏆',
      eyebrow: 'Prueba visible',
      titleLines: ['Certifica', 'tu avance'],
      description: 'Cada avance deja rastro: hitos, evaluación, entregables y evidencia suficiente para que una empresa vea algo más sólido que una promesa en CV.',
      imageUrl:
        'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Persona presentando resultados y logros en una pantalla',
      accent: 'amber' as const,
      noteLabel: 'Señal',
      noteValue: 'Skill proof'
    }
  ];

  readonly typewriterTexts = [
    'Proyectos Reales',
    'Experiencia Práctica',
    'Crecimiento Profesional',
    'Oportunidades Únicas'
  ];

  reasons = [
    {
      tag: 'Trabajo en equipo',
      title: 'Aprendes a coordinar entregables con otras personas.',
      description: 'Dejas de trabajar aislado y empiezas a moverte con dependencias, feedback y objetivos compartidos.',
      imageUrl:
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Equipo colaborando frente a una mesa de trabajo'
    },
    {
      tag: 'Presión real',
      title: 'Tomas decisiones con tiempo, contexto y fricción.',
      description: 'No todo sale perfecto al primer intento. Aprendes a responder con criterio cuando el reloj sí importa.',
      imageUrl:
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Equipo trabajando bajo presión en una reunión intensa'
    },
    {
      tag: 'Negociación',
      title: 'Aprendes a defender alcance, prioridades y valor.',
      description: 'No solo ejecutas tareas: entiendes qué negociar, qué priorizar y cómo sostener una conversación profesional.',
      imageUrl:
        'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Profesionales negociando alrededor de una mesa'
    },
    {
      tag: 'Estimación',
      title: 'Vuelves visible cuánto cuesta hacer bien un trabajo.',
      description: 'Empiezas a dimensionar tiempos, riesgos y esfuerzo con más precisión y menos improvisación.',
      imageUrl:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Persona planificando tiempos y estimaciones en un tablero'
    },
    {
      tag: 'Feedback',
      title: 'Recibes criterio que sí sirve para mejorar.',
      description: 'Cada revisión te obliga a ajustar, iterar y elevar el estándar, no solo a cumplir por cumplir.',
      imageUrl:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Mentoría activa con revisión de trabajo en computador'
    },
    {
      tag: 'Señal profesional',
      title: 'Construyes evidencia que una empresa sí entiende.',
      description: 'Tu avance deja rastro: decisiones, entregables, revisiones y resultados que hablan por ti.',
      imageUrl:
        'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1400&q=80',
      imageAlt: 'Presentación de resultados frente a un equipo'
    }
  ];

  steps = [
    {
      phase: 'Fase 01',
      title: 'Regístrate y Crea tu Perfil',
      description: 'Completa tu perfil con habilidades, stack, intereses y la evidencia que quieres convertir en señal profesional.',
      beforeImageUrl:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80',
      afterImageUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80',
      beforeLabel: 'Antes: perfil vacío',
      afterLabel: 'Después: perfil listo'
    },
    {
      phase: 'Fase 02',
      title: 'Explora Proyectos Disponibles',
      description: 'Filtra retos activos, entiende el contexto de cada empresa y detecta dónde sí encajas antes de postularte.',
      beforeImageUrl:
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1400&q=80',
      afterImageUrl:
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80',
      beforeLabel: 'Antes: búsqueda dispersa',
      afterLabel: 'Después: oportunidades claras'
    },
    {
      phase: 'Fase 03',
      title: 'Aplica y Comienza a Trabajar',
      description: 'Postúlate, recibe feedback, entra al flujo de entregables y empieza a construir experiencia con contexto real.',
      beforeImageUrl:
        'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80',
      afterImageUrl:
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1400&q=80',
      beforeLabel: 'Antes: solo intención',
      afterLabel: 'Después: ejecución visible'
    }
  ];

  readonly currentYear = new Date().getFullYear();

  private animationFrameId?: number;
  private scriptsLoaded = false;
  private experience?: BlackbirdExperience;
  private gsapContext?: { revert: () => void };
  private magneticCleanups: Array<() => void> = [];
  private landingCleanups: Array<() => void> = [];
  private preloaderExitTimeoutId?: number;
  private typewriterActivationTimeoutId?: number;

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
    window.clearTimeout(this.preloaderExitTimeoutId);
    window.clearTimeout(this.typewriterActivationTimeoutId);
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
      'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/Flip.min.js',
      'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/CustomEase.min.js',
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
    this.initLandingAnimations();
    this.beginEntranceTransition();
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
    const touchMode = window.matchMedia('(max-width: 980px), (pointer: coarse)').matches;

    this.gsapContext = gsap.context(() => {
      this.setupHeroReveal(gsap, ScrollTrigger, contentElement, prefersReducedMotion, touchMode);
      this.setupFeatureStories(gsap, ScrollTrigger, contentElement, prefersReducedMotion, touchMode);
      this.setupStepsSequence(gsap, ScrollTrigger, contentElement, prefersReducedMotion, touchMode);
      this.setupFinalCtaSequence(gsap, ScrollTrigger, contentElement, prefersReducedMotion, touchMode);
      this.setupAmbientMotion(gsap, contentElement, prefersReducedMotion, touchMode);
      this.setupStatCounters(gsap, ScrollTrigger, contentElement, prefersReducedMotion, touchMode);
      this.setupMagneticButtons(gsap, contentElement, prefersReducedMotion, touchMode);
      this.setupFinalCtaSpotlight(gsap, contentElement, prefersReducedMotion, touchMode);
    }, contentElement);

    window.setTimeout(() => ScrollTrigger.refresh(), 150);
  }

  private beginEntranceTransition(): void {
    this.isReady = true;
    window.clearTimeout(this.preloaderExitTimeoutId);
    this.preloaderExitTimeoutId = window.setTimeout(() => {
      this.isPreloaderVisible = false;
      this.toggleBodyScroll(false);
    }, 420);
  }

  private scheduleTypewriterActivation(delay: number): void {
    this.isHeroTypewriterActive = false;
    window.clearTimeout(this.typewriterActivationTimeoutId);
    if (delay < 0) {
      return;
    }
    this.typewriterActivationTimeoutId = window.setTimeout(() => {
      this.isHeroTypewriterActive = true;
    }, delay);
  }

  private cleanupLandingAnimations(): void {
    this.magneticCleanups.forEach((cleanup) => cleanup());
    this.magneticCleanups = [];
    this.landingCleanups.forEach((cleanup) => cleanup());
    this.landingCleanups = [];
    this.gsapContext?.revert();
    this.gsapContext = undefined;
  }

  private setupHeroReveal(
    gsap: any,
    ScrollTrigger: any,
    root: HTMLElement,
    reducedMotion: boolean,
    touchMode: boolean
  ): void {
    if (!root.querySelector('.hero-intro')) {
      return;
    }

    const publicHeader = document.querySelector<HTMLElement>('.public-header-shell');
    const titleFragments = Array.from(root.querySelectorAll<HTMLElement>('.hero-title-fragment__text'));
    const revealBlocks = Array.from(root.querySelectorAll<HTMLElement>('.hero-reveal__inner'));
    const CustomEase = (window as any).CustomEase;
    const introEase = CustomEase?.create
      ? CustomEase.create('hero-intro-ease', '0.52, 0.00, 0.48, 1.00')
      : 'power4.out';
    const heroDuration = reducedMotion ? 0.01 : touchMode ? 0.5 : 0.92;
    const revealDuration = reducedMotion ? 0.01 : touchMode ? 0.38 : 0.62;
    const typewriterDelay = reducedMotion ? 0 : touchMode ? 90 : 180;

    this.scheduleTypewriterActivation(-1);

    if (publicHeader) {
      gsap.set(publicHeader, {
        y: 0,
        filter: reducedMotion ? 'blur(0px)' : 'blur(8px)',
        opacity: reducedMotion ? 1 : 0
      });
    }

    titleFragments.forEach((fragment) => {
      const shift = Number(fragment.parentElement?.getAttribute('data-shift') ?? 0);
      gsap.set(fragment, {
        x: reducedMotion ? 0 : shift * 0.34,
        y: 0,
        filter: reducedMotion ? 'blur(0px)' : 'blur(10px)',
        opacity: reducedMotion ? 1 : 0
      });
    });

    revealBlocks.forEach((block) => {
      if (block.closest('.hero-note--top')) {
        return;
      }

      gsap.set(block, {
        y: 0,
        filter: reducedMotion ? 'blur(0px)' : 'blur(10px)',
        opacity: reducedMotion ? 1 : 0
      });
    });

    gsap.set('.hero-book-btn__circle', {
      scale: reducedMotion ? 1 : 0.96,
      filter: reducedMotion ? 'blur(0px)' : 'blur(12px)',
      autoAlpha: reducedMotion ? 1 : 0
    });

    const heroTimeline = gsap.timeline({
      defaults: {
        ease: introEase,
        force3D: true
      },
      onComplete: () => this.scheduleTypewriterActivation(typewriterDelay)
    });

    if (publicHeader) {
      heroTimeline.to(
        publicHeader,
        {
          y: 0,
          filter: 'blur(0px)',
          opacity: 1,
          duration: reducedMotion ? 0.01 : touchMode ? 0.45 : 0.8
        },
        0
      );
    }

    titleFragments.forEach((fragment, index) => {
      heroTimeline.to(
        fragment,
        {
          x: 0,
          y: 0,
          filter: 'blur(0px)',
          opacity: 1,
          duration: heroDuration
        },
        index === 0 ? 0.04 : 0.1 + index * (touchMode ? 0.08 : 0.12)
      );
    });

    revealBlocks.forEach((block, index) => {
      if (block.closest('.hero-note--top')) {
        return;
      }

      heroTimeline.to(
        block,
        {
          y: 0,
          filter: 'blur(0px)',
          opacity: 1,
          duration: revealDuration
        },
        0.34 + index * (touchMode ? 0.05 : 0.08)
      );
    });

    heroTimeline
      .to(
        '.hero-book-btn__circle',
        {
          scale: 1,
          filter: 'blur(0px)',
          autoAlpha: 1,
          duration: reducedMotion ? 0.01 : touchMode ? 0.5 : 0.96
        },
        touchMode ? 0.5 : 0.7
      );

    if (reducedMotion) {
      return;
    }
  }

  private setupAmbientMotion(gsap: any, root: HTMLElement, reducedMotion: boolean, touchMode: boolean): void {
    if (reducedMotion || touchMode) {
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
  }

  private setupStepsSequence(
    gsap: any,
    ScrollTrigger: any,
    root: HTMLElement,
    reducedMotion: boolean,
    touchMode: boolean
  ): void {
    const whyIntro = root.querySelector<HTMLElement>('.steps-why-intro');
    const howIntro = root.querySelector<HTMLElement>('.steps-how-intro');
    const gridLayout = root.querySelector<HTMLElement>('.steps-why-grid-layout');
    const parallaxStage = root.querySelector<HTMLElement>('.steps-why-parallax-stage');
    const journey = root.querySelector<HTMLElement>('.steps-journey');
    const storyColumn = root.querySelector<HTMLElement>('.steps-journey__story');
    const visualColumn = root.querySelector<HTMLElement>('.steps-journey__visual');
    const flowStage = root.querySelector<HTMLElement>('.steps-flow-stage');
    const flowBox = root.querySelector<HTMLElement>('.steps-flow-box');
    const flowImage = root.querySelector<HTMLImageElement>('.steps-flow-box__image');
    const flowTargets = Array.from(root.querySelectorAll<HTMLElement>('.steps-flow-marker'));
    const stepBlocks = Array.from(root.querySelectorAll<HTMLElement>('.steps-story-step'));

    if (!whyIntro || !howIntro) {
      return;
    }

    [whyIntro, howIntro].forEach((heading) =>
      gsap.from(heading, {
        y: reducedMotion ? 0 : 36,
        opacity: 0,
        duration: reducedMotion ? 0.01 : touchMode ? 0.45 : 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 82%',
          once: true
        }
      })
    );

    if (gridLayout) {
      const gridCards = Array.from(root.querySelectorAll<HTMLElement>('.steps-why-grid-card'));
      const columnOne = Array.from(root.querySelectorAll<HTMLElement>('[data-column="0"] .steps-why-grid-card'));
      const columnThree = Array.from(root.querySelectorAll<HTMLElement>('[data-column="2"] .steps-why-grid-card'));

      gsap.timeline({
        scrollTrigger: {
          trigger: gridLayout,
          start: 'top 75%',
          end: touchMode ? 'bottom 65%' : 'bottom bottom',
          scrub: reducedMotion || touchMode ? false : 0.65
        },
        defaults: { ease: 'power1.inOut' }
      })
        .from(
          gridLayout,
          {
            scale: reducedMotion ? 1 : touchMode ? 1.12 : 2.6
          },
          0
        )
        .from(
          columnOne,
          {
            xPercent: (index: number) => -((index + 1) * 30 + index * 60),
            yPercent: (index: number) => (index + 1) * 25 + index * 35,
            duration: reducedMotion ? 0.01 : 0.6
          },
          0
        )
        .from(
          columnThree,
          {
            xPercent: (index: number) => (index + 1) * 30 + index * 60,
            yPercent: (index: number) => (index + 1) * 25 + index * 35,
            duration: reducedMotion ? 0.01 : 0.6
          },
          0
        )
        .from(
          gridCards,
          {
            opacity: 0,
            duration: reducedMotion ? 0.01 : 0.35,
            stagger: 0.04
          },
          0
        );
    }

    if (parallaxStage && !touchMode) {
      const parallaxImage = parallaxStage.querySelector('.steps-why-parallax-image');

      gsap.from(parallaxStage, {
        scale: reducedMotion ? 1 : 0.42,
        scrollTrigger: {
          trigger: parallaxStage,
          start: 'top bottom',
          end: 'bottom top',
          scrub: reducedMotion ? false : 0.65
        }
      });

      if (parallaxImage) {
        gsap.fromTo(
          parallaxImage,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: parallaxStage,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1
            }
          }
        );
      }
    }

    stepBlocks.forEach((stepBlock) => {
      const pieces = Array.from(stepBlock.children) as HTMLElement[];
      gsap.from(pieces, {
        y: reducedMotion ? 0 : 28,
        opacity: 0,
        duration: reducedMotion ? 0.01 : touchMode ? 0.45 : 0.7,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: stepBlock,
          start: 'top 78%',
          once: true
        }
      });
    });

    if (
      touchMode ||
      reducedMotion ||
      !flowStage ||
      !flowBox ||
      !flowImage ||
      flowTargets.length === 0 ||
      stepBlocks.length === 0
    ) {
      return;
    }

    const Flip = (window as any).Flip;
    if (!Flip) {
      return;
    }

    if (journey && storyColumn && visualColumn && flowStage) {
      ScrollTrigger.create({
        trigger: journey,
        start: 'top 16%',
        end: () => `+=${Math.max(storyColumn.offsetHeight - flowStage.offsetHeight, window.innerHeight * 0.8)}`,
        pin: visualColumn,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true
      });
    }

    const setActiveStep = (activeIndex: number, animate = true) => {
      stepBlocks.forEach((block, index) => {
        block.classList.toggle('is-active', index === activeIndex);
      });

      const target = flowTargets[activeIndex];
      if (!target) {
        return;
      }

      const step = this.steps[activeIndex];
      if (step) {
        flowImage.src = step.afterImageUrl;
        flowImage.alt = step.afterLabel;
      }

      if (animate) {
        gsap.timeline({ defaults: { overwrite: true } })
          .fromTo(
            flowImage,
            { autoAlpha: 0.45, scale: 0.92 },
            { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'power2.out' },
            0
          )
          .add(
            Flip.fit(flowBox, target, {
              duration: 0.85,
              ease: 'power2.inOut',
              absolute: true,
              scale: true
            }),
            0
          );
      } else {
        Flip.fit(flowBox, target, {
          duration: 0,
          absolute: true,
          scale: true
        });
        gsap.set(flowImage, { autoAlpha: 1, scale: 1 });
      }
    };

    setActiveStep(0, false);

    stepBlocks.forEach((stepBlock, index) => {
      ScrollTrigger.create({
        trigger: stepBlock,
        start: 'top 58%',
        end: 'bottom 42%',
        onEnter: () => setActiveStep(index, true),
        onEnterBack: () => setActiveStep(index, true)
      });
    });

    const handleResize = () => {
      setActiveStep(Math.max(0, stepBlocks.findIndex((block) => block.classList.contains('is-active'))), false);
    };

    window.addEventListener('resize', handleResize);
    this.landingCleanups.push(() => {
      window.removeEventListener('resize', handleResize);
    });
  }

  private setupFinalCtaSequence(
    gsap: any,
    ScrollTrigger: any,
    root: HTMLElement,
    reducedMotion: boolean,
    touchMode: boolean
  ): void {
    const panel = root.querySelector<HTMLElement>('.cta-band__panel');
    if (!panel) {
      return;
    }

    const copyParts = Array.from(
      panel.querySelectorAll<HTMLElement>('.cta-band__eyebrow, .cta-band__title, .cta-band__text, .cta-band__proof-chip')
    );
    const metaParts = Array.from(
      panel.querySelectorAll<HTMLElement>('.cta-band__meta-label, .cta-band__stat, .cta-band__actions .btn-theme')
    );

    gsap.from(panel, {
      y: reducedMotion ? 0 : 40,
      opacity: 0,
      scale: reducedMotion ? 1 : 0.96,
      duration: reducedMotion ? 0.01 : touchMode ? 0.5 : 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 82%',
        once: true
      }
    });

    gsap.from(copyParts, {
      y: reducedMotion ? 0 : 24,
      opacity: 0,
      duration: reducedMotion ? 0.01 : touchMode ? 0.42 : 0.7,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 78%',
        once: true
      }
    });

    gsap.from(metaParts, {
      x: reducedMotion ? 0 : 24,
      opacity: 0,
      duration: reducedMotion ? 0.01 : touchMode ? 0.44 : 0.72,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 74%',
        once: true
      }
    });

    if (!reducedMotion && !touchMode) {
      gsap.fromTo(
        panel,
        { yPercent: 4 },
        {
          yPercent: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1
          }
        }
      );
    }
  }

  private setupFeatureStories(
    gsap: any,
    ScrollTrigger: any,
    root: HTMLElement,
    reducedMotion: boolean,
    touchMode: boolean
  ): void {
    const stories = Array.from(root.querySelectorAll<HTMLElement>('.feature-arch__info'));
    const arch = root.querySelector<HTMLElement>('.feature-arch');
    const archRight = root.querySelector<HTMLElement>('.feature-arch__right');
    const desktopImageWrappers = archRight
      ? Array.from(archRight.querySelectorAll<HTMLElement>('.feature-arch__image-wrapper'))
      : [];
    const mobileImageWrappers = Array.from(
      root.querySelectorAll<HTMLElement>('.feature-arch__image-wrapper--mobile')
    );

    if (stories.length === 0 || !arch || !archRight) {
      return;
    }

    const intro = root.querySelector('.feature-stories-section__intro');
    if (intro) {
      gsap.from(intro, {
        y: reducedMotion ? 0 : 36,
        opacity: 0,
        duration: reducedMotion ? 0.01 : touchMode ? 0.45 : 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: intro,
          start: 'top 82%',
          once: true
        }
      });
    }

    stories.forEach((story, index) => {
      story.classList.toggle('is-active', index === 0);
    });

    desktopImageWrappers.forEach((wrapper) => {
      const order = wrapper.dataset['index'];
      if (order) {
        wrapper.style.zIndex = order;
      }
    });

    mobileImageWrappers.forEach((wrapper) => {
      const order = wrapper.dataset['index'];
      if (order) {
        wrapper.style.zIndex = order;
      }
    });

    const desktopQuery = window.matchMedia('(min-width: 981px)');
    const mobileQuery = window.matchMedia('(max-width: 980px)');

    if (desktopQuery.matches && desktopImageWrappers.length > 0) {
      const images = desktopImageWrappers
        .map(wrapper => wrapper.querySelector<HTMLElement>('.feature-arch__image'))
        .filter(Boolean) as HTMLElement[];
      const transitionHold = reducedMotion ? 0.01 : touchMode ? 0.08 : 0.38;
      const finalHold = reducedMotion ? 0.01 : touchMode ? 0.16 : 0.7;

      gsap.set(desktopImageWrappers, {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1
      });

      gsap.set(images, {
        objectPosition: '50% 0%'
      });

      const desktopTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: arch,
          start: 'top top',
          end: 'bottom bottom',
          pin: archRight,
          scrub: reducedMotion || touchMode ? false : 1,
          invalidateOnRefresh: true
        }
      });

      images.forEach((image, index) => {
        const currentWrapper = desktopImageWrappers[index];
        const nextImage = images[index + 1] ?? null;
        const nextWrapper = desktopImageWrappers[index + 1] ?? null;

        const sectionTimeline = gsap.timeline({
          onStart: () => {
            stories.forEach((story, storyIndex) => story.classList.toggle('is-active', storyIndex === index));
            currentWrapper?.classList.add('is-active');
          },
          onReverseComplete: () => {
            stories.forEach((story, storyIndex) => story.classList.toggle('is-active', storyIndex === Math.max(index - 1, 0)));
            currentWrapper?.classList.toggle('is-active', index === 0);
          }
        });

        if (nextImage && nextWrapper) {
          const holdState = { progress: 0 };
          sectionTimeline
            .to(holdState, {
              progress: 1,
              duration: transitionHold,
              ease: 'none'
            })
            .to(
              currentWrapper,
              {
                clipPath: reducedMotion ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)',
                duration: reducedMotion ? 0.01 : 1.3,
                ease: 'none'
              },
              0
            )
            .to(
              image,
              {
                objectPosition: reducedMotion ? '50% 0%' : '50% 60%',
                duration: reducedMotion ? 0.01 : 1.3,
                ease: 'none'
              },
              0
            )
            .fromTo(
              nextImage,
              {
                objectPosition: reducedMotion ? '50% 50%' : '50% 35%',
                scale: reducedMotion ? 1 : 1.06
              },
              {
                objectPosition: reducedMotion ? '50% 50%' : '50% 55%',
                scale: 1,
                duration: reducedMotion ? 0.01 : 1.3,
                ease: 'none'
              },
              0
            )
            .to(
              nextWrapper,
              {
                opacity: 1,
                duration: reducedMotion ? 0.01 : 1.3,
                ease: 'none',
                onStart: () => {
                  stories.forEach((story, storyIndex) => story.classList.toggle('is-active', storyIndex === index + 1));
                  nextWrapper.classList.add('is-active');
                }
              },
              0
            );
        }

        desktopTimeline.add(sectionTimeline);
      });

      const endState = { progress: 0 };
      desktopTimeline.to(endState, {
        progress: 1,
        duration: finalHold,
        ease: 'none'
      });
    }

    stories.forEach((story) => {
      const storyIndex = Number(story.dataset['index'] ?? '0');
      const lines = Array.from(story.querySelectorAll<HTMLElement>('.feature-arch__line-inner'));
      const copy = story.querySelector('.feature-arch__desc');
      const note = story.querySelector('.feature-arch__meta');
      const cue = story.querySelector('.feature-arch__next');
      const textTargets = [copy, note].filter(Boolean);
      const cueTargets = [cue].filter(Boolean);
      const relatedImage = mobileImageWrappers[storyIndex]?.querySelector<HTMLElement>('.feature-arch__image');

      ScrollTrigger.create({
        trigger: story,
        start: 'top 60%',
        end: 'bottom 40%',
        toggleClass: { targets: story, className: 'is-active' }
      });

      if (relatedImage && mobileQuery.matches && !reducedMotion && !touchMode) {
        gsap.fromTo(
          relatedImage,
          { objectPosition: '50% 60%' },
          {
            objectPosition: '50% 30%',
            ease: 'none',
            scrollTrigger: {
              trigger: story,
              start: 'top 85%',
              end: 'bottom 15%',
              scrub: 1.1
            }
          }
        );
      }

      const timeline = gsap.timeline({
        defaults: {
          ease: 'power4.out',
          force3D: true
        },
        scrollTrigger: {
          trigger: story,
          start: 'top 72%',
          once: true
        }
      });

      timeline
        .from(lines, {
          yPercent: reducedMotion ? 0 : 120,
          duration: reducedMotion ? 0.01 : touchMode ? 0.5 : 1.1,
          stagger: 0.08
        })
        .from(
          textTargets,
          {
            y: reducedMotion ? 0 : 28,
            opacity: 0,
            duration: reducedMotion ? 0.01 : touchMode ? 0.42 : 0.7,
            stagger: 0.08
          },
          '-=0.75'
        )
        .from(
          cueTargets,
          {
            y: reducedMotion ? 0 : 24,
            opacity: 0,
            duration: reducedMotion ? 0.01 : touchMode ? 0.4 : 0.65,
            stagger: 0.06
          },
          '-=0.55'
        );
    });
  }

  private setupStatCounters(
    gsap: any,
    ScrollTrigger: any,
    root: HTMLElement,
    reducedMotion: boolean,
    touchMode: boolean
  ): void {
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
            duration: reducedMotion ? 0.01 : touchMode ? 0.7 : 1.6,
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

  private setupMagneticButtons(gsap: any, root: HTMLElement, reducedMotion: boolean, touchMode: boolean): void {
    if (reducedMotion || touchMode) {
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

  private setupFinalCtaSpotlight(gsap: any, root: HTMLElement, reducedMotion: boolean, touchMode: boolean): void {
    if (reducedMotion || touchMode) {
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
