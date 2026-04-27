import { Component, ElementRef, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
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
      github: 'https://github.com/NicoLa5Tor',
      githubLabel: 'NicoLa5Tor',
      phone: '310 339 1854',
      whatsapp: 'https://wa.me/573103391854'
    },
    {
      name: 'Yamid Felipe Quiroga Gonzales', 
      role: 'Full-Stack Developer',
      github: 'https://github.com/YFQG',
      githubLabel: 'YFQG',
      phone: '321 464 7006',
      whatsapp: 'https://wa.me/573214647006'
    }
  ];

  footerLinks = {
    platform: [
      { label: 'Cómo Funciona', href: '#how-it-works', description: 'Recorrido general de la plataforma.' },
      { label: 'Proyectos', href: '#projects', description: 'Vista general de retos y ejecución real.' },
      { label: 'Empresas', href: '#companies', description: 'Registro y flujo para organizaciones.' },
      { label: 'Contacto', href: '/contact', description: 'Canales directos para hablar con UniDev.' }
    ],
    access: [
      { label: 'Login', href: '/login', displayHref: 'unidev.site/login' },
      { label: 'Pricing', href: '/pricing', displayHref: 'unidev.site/pricing' },
      { label: 'Universidades', href: '/universities', displayHref: 'unidev.site/universities' },
      { label: 'Contacto', href: '/contact', displayHref: 'unidev.site/contact' }
    ],
    build: [
      { label: 'NicoLa5Tor', href: 'https://github.com/NicoLa5Tor', displayHref: 'github.com/NicoLa5Tor' },
      { label: 'YFQG', href: 'https://github.com/YFQG', displayHref: 'github.com/YFQG' }
    ]
  };

  constructor(
    private animationService: AnimationService,
    private elementRef: ElementRef,
    private router: Router,
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

  navigateTo(path: string): void {
    this.router.navigateByUrl(path);
  }

  openExternalLink(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
