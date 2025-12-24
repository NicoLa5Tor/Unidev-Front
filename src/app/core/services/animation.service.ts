import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as anime from 'animejs';

export interface AnimationConfig {
  targets: string | Element | Element[] | NodeList;
  duration?: number;
  easing?: string;
  delay?: number;
  translateX?: number[] | number;
  translateY?: number[] | number;
  scale?: number[] | number;
  rotate?: string | number[] | number;
  opacity?: number[] | number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private anime: any = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.anime = anime;
    }
  }

  // Basic animations
  fadeIn(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      opacity: [0, 1],
      duration,
      easing: 'easeOutCubic'
    });
  }

  fadeOut(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      opacity: [1, 0],
      duration,
      easing: 'easeOutCubic'
    });
  }

  slideInUp(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      translateY: [50, 0],
      opacity: [0, 1],
      duration,
      easing: 'easeOutCubic'
    });
  }

  slideInDown(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      translateY: [-50, 0],
      opacity: [0, 1],
      duration,
      easing: 'easeOutCubic'
    });
  }

  slideInLeft(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      translateX: [-50, 0],
      opacity: [0, 1],
      duration,
      easing: 'easeOutCubic'
    });
  }

  slideInRight(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      translateX: [50, 0],
      opacity: [0, 1],
      duration,
      easing: 'easeOutCubic'
    });
  }

  // Scale animations
  scaleIn(targets: string | Element | Element[], duration: number = 800): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      scale: [0, 1],
      opacity: [0, 1],
      duration,
      easing: 'easeOutElastic(1, .8)'
    });
  }

  scaleOut(targets: string | Element | Element[], duration: number = 600): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      scale: [1, 0],
      opacity: [1, 0],
      duration,
      easing: 'easeInCubic'
    });
  }

  // Rotation animations
  rotateIn(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      rotate: [180, 0],
      opacity: [0, 1],
      duration,
      easing: 'easeOutCubic'
    });
  }

  // Bounce animation
  bounce(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      translateY: [
        { value: -20, duration: duration * 0.25 },
        { value: 0, duration: duration * 0.25 },
        { value: -10, duration: duration * 0.25 },
        { value: 0, duration: duration * 0.25 }
      ],
      easing: 'easeOutBounce'
    });
  }

  // Shake animation
  shake(targets: string | Element | Element[], duration: number = 800): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      translateX: [
        { value: 10, duration: duration * 0.1 },
        { value: -10, duration: duration * 0.1 },
        { value: 10, duration: duration * 0.1 },
        { value: -10, duration: duration * 0.1 },
        { value: 10, duration: duration * 0.1 },
        { value: -10, duration: duration * 0.1 },
        { value: 10, duration: duration * 0.1 },
        { value: -10, duration: duration * 0.1 },
        { value: 0, duration: duration * 0.2 }
      ],
      easing: 'easeOutCubic'
    });
  }

  // Pulse animation
  pulse(targets: string | Element | Element[], duration: number = 1000): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      scale: [1, 1.1, 1],
      duration,
      easing: 'easeInOutSine',
      loop: true
    });
  }

  // Stagger animations for multiple elements
  staggerFadeIn(targets: string | Element | Element[], staggerDelay: number = 100): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 800,
      delay: function(el: any, i: any) { return i * staggerDelay; },
      easing: 'easeOutCubic'
    });
  }

  // Custom animation with full control
  custom(config: AnimationConfig): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime(config);
  }

  // Timeline animations
  createTimeline(): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime.timeline({});
  }

  // Loading spinner
  loadingSpinner(targets: string | Element | Element[]): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      rotate: '1turn',
      duration: 1000,
      loop: true,
      easing: 'linear'
    });
  }

  // Button hover effects
  buttonHover(targets: string | Element | Element[]): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      scale: 1.05,
      duration: 200,
      easing: 'easeOutCubic'
    });
  }

  buttonHoverOut(targets: string | Element | Element[]): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      scale: 1,
      duration: 200,
      easing: 'easeOutCubic'
    });
  }

  // Page transition animations
  pageEnter(targets: string | Element | Element[]): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 600,
      easing: 'easeOutCubic'
    });
  }

  pageExit(targets: string | Element | Element[]): any {
    if (!this.anime || !isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.anime({
      targets,
      opacity: [1, 0],
      translateY: [0, -30],
      duration: 400,
      easing: 'easeInCubic'
    });
  }
}
