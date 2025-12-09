import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UnicornEmbedService {
  private renderer: Renderer2;
  private scriptPromises = new Map<string, Promise<void>>();
  private initializedScripts = new Set<string>();

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  loadScript(scriptUrl: string): Promise<void> {
    const existingScript = this.document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      return existingScript.dataset['loaded'] === 'true'
        ? Promise.resolve()
        : this.scriptPromises.get(scriptUrl) ?? Promise.resolve();
    }

    const cachedPromise = this.scriptPromises.get(scriptUrl);
    if (cachedPromise) {
      return cachedPromise;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = this.renderer.createElement('script') as HTMLScriptElement;
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        script.dataset['loaded'] = 'true';
        resolve();
      };

      script.onerror = (event) => {
        this.scriptPromises.delete(scriptUrl);
        reject(event);
      };

      this.renderer.appendChild(this.document.body, script);
    });

    this.scriptPromises.set(scriptUrl, promise);
    return promise;
  }

  async initialize(scriptUrl: string): Promise<void> {
    await this.loadScript(scriptUrl);

    const unicornStudio = (this.document.defaultView as any)?.UnicornStudio;
    if (this.initializedScripts.has(scriptUrl) || !unicornStudio) {
      return;
    }

    if (typeof unicornStudio.init === 'function' && !unicornStudio.isInitialized) {
      unicornStudio.init();
      unicornStudio.isInitialized = true;
      this.initializedScripts.add(scriptUrl);
    }
  }
}
