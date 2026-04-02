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
      this.setupFeatureStories(gsap, ScrollTrigger, contentElement, prefersReducedMotion);
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

  private setupFeatureStories(gsap: any, ScrollTrigger: any, root: HTMLElement, reducedMotion: boolean): void {
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
        duration: reducedMotion ? 0.01 : 0.8,
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
      const transitionHold = reducedMotion ? 0.01 : 0.38;
      const finalHold = reducedMotion ? 0.01 : 0.7;

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
          scrub: reducedMotion ? false : 1,
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

      if (relatedImage && mobileQuery.matches && !reducedMotion) {
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
          duration: reducedMotion ? 0.01 : 1.1,
          stagger: 0.08
        })
        .from(
          textTargets,
          {
            y: reducedMotion ? 0 : 28,
            opacity: 0,
            duration: reducedMotion ? 0.01 : 0.7,
            stagger: 0.08
          },
          '-=0.75'
        )
        .from(
          cueTargets,
          {
            y: reducedMotion ? 0 : 24,
            opacity: 0,
            duration: reducedMotion ? 0.01 : 0.65,
            stagger: 0.06
          },
          '-=0.55'
        );
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
