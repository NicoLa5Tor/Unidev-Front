import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { BlackbirdExperience, BlackbirdExperienceDeps } from '../../../../shared/effects/blackbird-experience';
import { HeaderComponent } from '../../../landing/components/header/header.component';
import { HeroFeaturesSectionComponent } from '../../../landing/components/hero/sections/hero-features-section/hero-features-section.component';
import { HeroFinalCtaSectionComponent } from '../../../landing/components/hero/sections/hero-final-cta-section/hero-final-cta-section.component';
import { HeroIntroSectionComponent } from '../../../landing/components/hero/sections/hero-intro-section/hero-intro-section.component';
import { HeroStepsSectionComponent } from '../../../landing/components/hero/sections/hero-steps-section/hero-steps-section.component';

@Component({
  selector: 'app-blackbird-experience',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
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

  ngOnInit(): void {
    this.toggleBodyScroll(true);
  }

  async ngAfterViewInit(): Promise<void> {
    await this.loadRequiredScripts();
    this.startExperience();
  }

  ngOnDestroy(): void {
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
  }

  private toggleBodyScroll(lock: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.body.classList.toggle('preloader-active', lock);
  }
}
