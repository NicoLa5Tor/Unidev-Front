import { Component, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AnimationService } from '../../../../core/services/animation.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements AfterViewInit {
  currentYear = new Date().getFullYear();
  
  creators = [
    {
      name: 'Nicolas Rodriguez Torres',
      role: 'Full-Stack Developer',
      linkedin: '#',
      github: '#',
      email: 'nicolas@unidev.com'
    },
    {
      name: 'Yamid Felipe Quiroga Gonzales', 
      role: 'Frontend Developer',
      linkedin: '#',
      github: '#',
      email: 'yamid@unidev.com'
    }
  ];

  socialLinks = [
    { icon: '📧', label: 'Email', href: 'mailto:info@unidev.com' },
    { icon: '💼', label: 'LinkedIn', href: '#' },
    { icon: '🐙', label: 'GitHub', href: '#' },
    { icon: '🐦', label: 'Twitter', href: '#' }
  ];

  footerLinks = {
    platform: [
      { label: 'Cómo Funciona', href: '#how-it-works' },
      { label: 'Proyectos', href: '#projects' },
      { label: 'Empresas', href: '#companies' },
      { label: 'Estudiantes', href: '#students' }
    ],
    support: [
      { label: 'Centro de Ayuda', href: '#help' },
      { label: 'Documentación', href: '#docs' },
      { label: 'API', href: '#api' },
      { label: 'Estado del Sistema', href: '#status' }
    ],
    legal: [
      { label: 'Términos de Servicio', href: '#terms' },
      { label: 'Política de Privacidad', href: '#privacy' },
      { label: 'Cookies', href: '#cookies' },
      { label: 'Código de Conducta', href: '#conduct' }
    ]
  };

  constructor(
    private animationService: AnimationService,
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Animate footer elements when they come into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateFooterElements();
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(this.elementRef.nativeElement);
  }

  private animateFooterElements(): void {
    // Animate logo and main content
    setTimeout(() => {
      this.animationService.slideInUp('.footer-logo', 800);
    }, 100);

    // Animate creators
    setTimeout(() => {
      this.animationService.staggerFadeIn('.creator-card', 200);
    }, 300);

    // Animate footer links
    setTimeout(() => {
      this.animationService.staggerFadeIn('.footer-section', 150);
    }, 500);

    // Animate social links
    setTimeout(() => {
      this.animationService.staggerFadeIn('.social-link', 100);
    }, 700);
  }
}
