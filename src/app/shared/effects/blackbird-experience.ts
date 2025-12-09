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

  private settings = {
    cameraDistance: 5,
    scalePeriod: 8
  };

  constructor(deps: BlackbirdExperienceDeps) {
    this.container = deps.container;
    this.contentElement = deps.contentElement;
    this.THREE = deps.THREE;
    this.gsap = deps.gsap;
    this.ScrollTrigger = deps.ScrollTrigger;
    this.ScrollSmoother = deps.ScrollSmoother;
    this.requestFrame = deps.requestFrame;
    this.onReady = deps.onReady;

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

    this.smoother = this.ScrollSmoother.create({
      content: this.contentElement,
      smooth: 1.2
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
  }

  private createApp(): void {
    this.renderer = new this.THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setPixelRatio(1.5);
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
    this.container.appendChild(this.renderer.domElement);

    this.camera = new this.THREE.PerspectiveCamera(
      45,
      this.container.offsetWidth / this.container.offsetHeight,
      1,
      10000
    );
    this.camera.position.set(0, 0, this.settings.cameraDistance);
    this.scene = new this.THREE.Scene();

    const globalOrbitControls =
      (window as any).THREE?.OrbitControls ?? (window as any).OrbitControls ?? null;
    const ControlsCtor = (this.THREE as any).OrbitControls ?? globalOrbitControls;
    if (!ControlsCtor) {
      throw new Error('OrbitControls no se encuentra disponible.');
    }

    this.controls = new ControlsCtor(this.camera, this.renderer.domElement);
    this.controls.enableKeys = false;
    this.controls.enableZoom = false;
    this.controls.enableDamping = false;

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
    this.camera.aspect = this.container.offsetWidth / this.container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
  }

  private createItems(): void {
    const boxGeom = new this.THREE.BoxBufferGeometry(2, 2, 2);
    const material = new this.THREE.MeshLambertMaterial({
      color: 0x9333ea,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.3
    });

    const itemCount = 40;
    for (let i = 0; i < itemCount; i++) {
      const mesh = new this.THREE.Mesh(boxGeom, material);
      mesh.position.y = 13 * (Math.random() * 2 - 1);
      mesh.position.x = 3 * (Math.random() * 2 - 1);
      mesh.position.z = 4 * (Math.random() * 2 - 1);
      mesh.rotation.y = Math.PI * Math.random();
      mesh.rotationSpeed = Math.random() * 0.01 + 0.005;
      this.scene.add(mesh);
      this.meshes.push(mesh);
    }
  }

  private update(): void {
    this.time = this.clock.getElapsedTime();
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
    });

    if (this.camera && this.smoother) {
      const cameraRange = 10;
      this.camera.position.y = this.mapToRange(
        this.smoother.progress,
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
