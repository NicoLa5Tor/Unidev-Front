import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HeroFinalCtaSectionComponent } from './sections/hero-final-cta-section/hero-final-cta-section.component';
import { HeroFeature, HeroFeaturesSectionComponent } from './sections/hero-features-section/hero-features-section.component';
import { HeroIntroSectionComponent, HeroStat } from './sections/hero-intro-section/hero-intro-section.component';
import { HeroStep, HeroStepsSectionComponent } from './sections/hero-steps-section/hero-steps-section.component';

@Component({
  selector: 'app-hero',
  imports: [
    HeroIntroSectionComponent,
    HeroFeaturesSectionComponent,
    HeroStepsSectionComponent,
    HeroFinalCtaSectionComponent
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent {
  readonly typewriterTexts = [
    'Proyectos Reales',
    'Experiencia Práctica',
    'Crecimiento Profesional',
    'Oportunidades Únicas'
  ];

  stats: HeroStat[] = [
    { number: '500+', label: 'Proyectos Activos', icon: '⚡' },
    { number: '1000+', label: 'Estudiantes', icon: '🎓' },
    { number: '200+', label: 'Empresas', icon: '🏢' },
    { number: '95%', label: 'Satisfacción', icon: '⭐' }
  ];

  features: HeroFeature[] = [
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

  steps: HeroStep[] = [
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


  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
