export type BlackbirdExperienceDeps = {
  container: HTMLElement;
  contentElement: HTMLElement;
  THREE: any;
  gsap: any;
  ScrollTrigger: any;
  ScrollSmoother: any;
  requestFrame: (callback: FrameRequestCallback) => number;
  onReady?: () => void;
};

export class BlackbirdExperience {
  private readonly container: HTMLElement;
  private readonly contentElement: HTMLElement;
  private readonly THREE: any;
  private readonly gsap: any;
  private readonly ScrollTrigger: any;
  private readonly ScrollSmoother: any;
  private readonly requestFrame: (callback: FrameRequestCallback) => number;
  private readonly onReady?: () => void;

  private renderer?: any;
  private camera?: any;
  private scene?: any;
  private controls?: any;
  private meshes: any[] = [];
  private clock: any;
  private time = 0;
  private smoother?: any;
  private animationFrameId?: number;
  private resizeHandler?: () => void;
  private scrollHandler?: () => void;
  private scrollProgress = 0;
  private lastRenderTime = 0;
  private readonly isMobile: boolean;
  private readonly isReducedMotion: boolean;
  private readonly quality: 'low' | 'high';

  private settings = {
    cameraDistance: 5,
    scalePeriod: 8
  };

  private getViewportSize(): { width: number; height: number } {
    const width = window.innerWidth || this.container.offsetWidth || this.container.clientWidth || 1;
    const height = window.innerHeight || this.container.offsetHeight || this.container.clientHeight || 1;
    return { width, height };
  }

  constructor(deps: BlackbirdExperienceDeps) {
    this.container = deps.container;
    this.contentElement = deps.contentElement;
    this.THREE = deps.THREE;
    this.gsap = deps.gsap;
    this.ScrollTrigger = deps.ScrollTrigger;
    this.ScrollSmoother = deps.ScrollSmoother;
    this.requestFrame = deps.requestFrame;
    this.onReady = deps.onReady;
    this.isMobile = window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.quality = this.isMobile || this.isReducedMotion ? 'low' : 'high';

    this.clock = new this.THREE.Clock();
    this.init();
  }

  dispose(): void {
    this.animationFrameId && cancelAnimationFrame(this.animationFrameId);
    this.controls?.dispose?.();
    this.renderer?.dispose?.();
    this.smoother?.kill?.();
    this.ScrollTrigger?.getAll?.().forEach((trigger: any) => trigger.kill());
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler, true);
    }
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler, true);
    }
    this.container.innerHTML = '';
  }

  private init(): void {
    this.createApp();
    this.createItems();
    this.initScroll();
    this.update();
    this.container.classList.add('is-ready');
    this.onReady?.();
  }

  private initScroll(): void {
    this.gsap.registerPlugin(this.ScrollTrigger, this.ScrollSmoother);

    if (this.quality === 'high') {
      this.smoother = this.ScrollSmoother.create({
        content: this.contentElement,
        smooth: 1.1,
        smoothTouch: 0.1
      });

      const spans = Array.from(this.contentElement.querySelectorAll('span'));
      spans.forEach((span) => {
        this.ScrollTrigger.create({
          trigger: span,
          start: 'top 90%',
          end: 'bottom 10%',
          onUpdate: (self: any) => {
            const dist = Math.abs(self.progress - 0.5);
            const lightness = this.mapToRange(dist, 0, 0.5, 80, 100);
            (span as HTMLElement).style.setProperty('--l', `${lightness}%`);
          }
        });
      });
      return;
    }

    this.scrollHandler = () => {
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      this.scrollProgress = window.scrollY / scrollable;
    };
    this.scrollHandler();
    window.addEventListener('scroll', this.scrollHandler, { passive: true, capture: true });
  }

  private createApp(): void {
    const { width, height } = this.getViewportSize();

    this.renderer = new this.THREE.WebGLRenderer({ antialias: false, alpha: true });
    const pixelRatio = this.quality === 'high' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new this.THREE.PerspectiveCamera(45, width / height, 1, 10000);
    this.camera.position.set(0, 0, this.settings.cameraDistance);
    this.scene = new this.THREE.Scene();

    this.resizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.resizeHandler, true);

    const ambientLight = new this.THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambientLight);

    const directionalLight = new this.THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 3, 2);
    directionalLight.target.position.set(0, 0, 0);
    this.scene.add(directionalLight);
  }

  private handleResize(): void {
    if (!this.camera || !this.renderer) {
      return;
    }
    const { width, height } = this.getViewportSize();
    const pixelRatio = this.quality === 'high' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height);
  }

  private createItems(): void {
    const boxGeom = new this.THREE.BoxBufferGeometry(2, 2, 2);
    const material = new this.THREE.MeshLambertMaterial({
      color: 0x9333ea,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.3
    });

    const itemCount = this.quality === 'high' ? 40 : 14;
    for (let i = 0; i < itemCount; i++) {
      const mesh = new this.THREE.Mesh(boxGeom, material);
      mesh.position.y = (this.quality === 'high' ? 13 : 10) * (Math.random() * 2 - 1);
      mesh.position.x = (this.quality === 'high' ? 3 : 2.2) * (Math.random() * 2 - 1);
      mesh.position.z = (this.quality === 'high' ? 4 : 3) * (Math.random() * 2 - 1);
      mesh.rotation.y = Math.PI * Math.random();
      mesh.rotationSpeed = this.quality === 'high' ? Math.random() * 0.01 + 0.005 : Math.random() * 0.004 + 0.002;
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }
  }

  private update(): void {
    const elapsed = this.clock.getElapsedTime();
    if (this.quality === 'low') {
      const now = performance.now();
      if (now - this.lastRenderTime < 1000 / 30) {
        this.animationFrameId = this.requestFrame(() => this.update());
        return;
      }
      this.lastRenderTime = now;
    }

    this.time = elapsed;
    this.updateItems();
    this.renderer?.render(this.scene, this.camera);
    this.animationFrameId = this.requestFrame(() => this.update());
  }

  private updateItems(): void {
    const amplitude = 0.05;
    const baseScale = 0.2;
    const period = this.settings.scalePeriod;
    const scaleEffect = baseScale + amplitude * Math.sin(Math.PI * 2 * (this.time / period));

    this.meshes.forEach((mesh) => {
      mesh.scale.set(scaleEffect, scaleEffect, scaleEffect);
      mesh.rotation.x += mesh.rotationSpeed;
      if (this.quality === 'high') {
        mesh.rotation.y += mesh.rotationSpeed * 0.5;
      }
    });

    if (this.camera) {
      const progress = this.smoother ? this.smoother.progress : this.scrollProgress;
      const cameraRange = this.quality === 'high' ? 10 : 6;
      this.camera.position.y = this.mapToRange(
        progress,
        0,
        1,
        cameraRange,
        -cameraRange
      );
    }
  }

  private mapToRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }
}
