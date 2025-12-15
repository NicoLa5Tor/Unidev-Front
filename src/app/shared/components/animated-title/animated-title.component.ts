import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScriptLoaderService } from '../../services/script-loader.service';

declare global {
  interface Window {
    gsap: any;
    SplitText: any;
  }
}

@Component({
  selector: 'app-animated-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #stage class="opacity-0">
      <h1
        #textEl
        class="txt text-4xl font-semibold leading-tight text-white lg:text-5xl"
        [ngClass]="textClass"
        [style.--fw]="fontWeight"
        [style.--fs]="fontStretch"
      >
        {{ text }}
      </h1>
    </div>
  `,
  styleUrl: './animated-title.component.scss'
})
export class AnimatedTitleComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input({ required: true }) text = 'Jello';
  @Input() fontWeight = 600;
  @Input() fontStretch = 150;
  @Input() textClass = '';

  @ViewChild('stage', { static: true }) stageRef!: ElementRef<HTMLElement>;
  @ViewChild('textEl', { static: true }) textRef!: ElementRef<HTMLElement>;

  private chars: HTMLElement[] = [];
  private splitInstance: any;
  private charHeight = 0;
  private isMouseDown = false;
  private mouseInitialY = 0;
  private mouseFinalY = 0;
  private charIndexSelected = 0;
  private dragYScale = 0;
  private readonly weightTarget = 400;
  private readonly stretchTarget = 80;
  private readonly maxYScale = 2.5;
  private readonly elasticDropOff = 0.8;
  private subscriptions: Array<() => void> = [];
  private initialized = false;

  constructor(
    private readonly scriptLoader: ScriptLoaderService,
    private readonly ngZone: NgZone
  ) {}

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') {
      return;
    }
    this.loadScripts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.initialized && changes['text'] && !changes['text'].firstChange) {
      this.resetAnimation();
      this.initAnimation();
    }
  }

  ngOnDestroy(): void {
    this.resetAnimation();
  }

  private async loadScripts(): Promise<void> {
    await this.scriptLoader.load('gsap', 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js');
    await this.scriptLoader.load('splitText', 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/16327/SplitText3.min.js');
    this.ngZone.runOutsideAngular(() => this.initAnimation());
  }

  private initAnimation(): void {
    const { gsap, SplitText } = window;
    if (!gsap || !SplitText) {
      console.error('GSAP o SplitText no están disponibles.');
      return;
    }

    this.resetAnimation();

    this.splitInstance = new SplitText(this.textRef.nativeElement, {
      type: 'chars',
      charsClass: 'char',
      position: 'relative'
    });
    this.chars = Array.from(this.stageRef.nativeElement.querySelectorAll<HTMLElement>('.char'));
    this.charHeight = this.textRef.nativeElement.offsetHeight;

    gsap.set(this.stageRef.nativeElement, { autoAlpha: 1 });
    gsap.set(this.chars, { transformOrigin: 'center bottom' });

    this.animInText();
    this.initialized = true;
  }

  private animInText(): void {
    const { gsap } = window;
    const firstChar = this.stageRef.nativeElement.querySelector<HTMLElement>('.char');
    if (!firstChar) {
      return;
    }

    const rect = firstChar.getBoundingClientRect();
    gsap.from(this.chars, {
      y: () => -1 * (rect.y + this.charHeight + 500),
      fontWeight: this.weightTarget,
      fontStretch: this.stretchTarget,
      scaleY: 2,
      ease: 'elastic(0.2, 0.1)',
      duration: 1.5,
      delay: 0.5,
      stagger: {
        each: 0.05,
        from: 'random'
      },
      onComplete: () => this.initDragEvents()
    });
  }

  private initDragEvents(): void {
    const handleMouseUp: EventListener = (evt: Event) => {
      const event = evt as MouseEvent;
      if (!this.isMouseDown) {
        return;
      }
      this.mouseFinalY = event.clientY;
      this.isMouseDown = false;
      document.body.classList.remove('cursor-grabbing');
      this.snapBackText();
    };

    const handleMouseMove: EventListener = (evt: Event) => {
      const event = evt as MouseEvent;
      if (!this.isMouseDown) {
        return;
      }
      this.mouseFinalY = event.clientY;
      this.calcDist();
      this.setFontDragDimensions();
    };

    const handleMouseLeave: EventListener = (evt: Event) => {
      const event = evt as MouseEvent;
      if (event.clientY <= 0 || event.clientX <= 0 || event.clientX >= window.innerWidth || event.clientY >= window.innerHeight) {
        this.snapBackText();
        this.isMouseDown = false;
      }
    };

    this.addListener(document.body, 'mouseup', handleMouseUp);
    this.addListener(document.body, 'mousemove', handleMouseMove);
    this.addListener(document.body, 'mouseleave', handleMouseLeave);
    this.addListener(window, 'resize', () => this.charHeight = this.textRef.nativeElement.offsetHeight);

    this.chars.forEach((char, index) => {
      const handler: EventListener = (evt: Event) => {
        const event = evt as MouseEvent;
        this.mouseInitialY = event.clientY;
        this.charIndexSelected = index;
        this.isMouseDown = true;
        document.body.classList.add('cursor-grabbing');
      };
      this.addListener(char, 'mousedown', handler);
    });
  }

  private calcDist(): void {
    const maxYDragDist = this.charHeight * (this.maxYScale - 1);
    const distY = this.mouseInitialY - this.mouseFinalY;
    this.dragYScale = distY / maxYDragDist;
    if (this.dragYScale > this.maxYScale - 1) {
      this.dragYScale = this.maxYScale - 1;
    } else if (this.dragYScale < -0.5) {
      this.dragYScale = -0.5;
    }
  }

  private setFontDragDimensions(): void {
    const { gsap } = window;
    gsap.to(this.chars, {
      y: (_target: HTMLElement, _unused: number, idx: number) => this.calcDispersion(idx) * -50,
      fontWeight: (_target: HTMLElement, _unused: number, idx: number) => this.interpolateWeight(idx),
      fontStretch: (_target: HTMLElement, _unused: number, idx: number) => this.interpolateStretch(idx),
      scaleY: (_target: HTMLElement, _unused: number, idx: number) => this.interpolateScale(idx),
      ease: 'power4',
      duration: 0.6
    });
  }

  private interpolateWeight(index: number): number {
    const dispersion = this.calcDispersion(index);
    return this.fontWeight - (dispersion * (this.fontWeight - this.weightTarget));
  }

  private interpolateStretch(index: number): number {
    const dispersion = this.calcDispersion(index);
    return this.fontStretch - (dispersion * (this.fontStretch - this.stretchTarget));
  }

  private interpolateScale(index: number): number {
    const dispersion = this.calcDispersion(index);
    let scaleY = 1 + dispersion;
    if (scaleY < 0.5) {
      scaleY = 0.5;
    }
    return scaleY;
  }

  private calcDispersion(index: number): number {
    const dispersion = 1 - (Math.abs(index - this.charIndexSelected) / (this.chars.length * this.elasticDropOff));
    return dispersion * this.dragYScale;
  }

  private snapBackText(): void {
    const { gsap } = window;
    gsap.to(this.chars, {
      y: 0,
      fontWeight: this.fontWeight,
      fontStretch: this.fontStretch,
      scale: 1,
      ease: 'elastic(0.35, 0.1)',
      duration: 1,
      stagger: {
        each: 0.02,
        from: this.charIndexSelected
      }
    });
  }

  private addListener(target: EventTarget, event: string, handler: EventListenerOrEventListenerObject): void {
    target.addEventListener(event, handler);
    this.subscriptions.push(() => target.removeEventListener(event, handler));
  }

  private resetAnimation(): void {
    this.subscriptions.forEach(cleanup => cleanup());
    this.subscriptions = [];
    if (this.splitInstance) {
      this.splitInstance.revert();
      this.splitInstance = null;
    }
    this.chars = [];
    this.isMouseDown = false;
    document.body.classList.remove('cursor-grabbing');
  }
}
