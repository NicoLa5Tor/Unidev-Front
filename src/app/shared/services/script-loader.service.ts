import { Injectable } from '@angular/core';

interface ScriptEntry {
  src: string;
  promise: Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {
  private readonly scripts = new Map<string, ScriptEntry>();

  load(name: string, src: string): Promise<void> {
    const existing = this.scripts.get(name);
    if (existing) {
      if (existing.src === src) {
        return existing.promise;
      }
      this.scripts.delete(name);
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`No se pudo cargar el script ${src}`));
      document.body.appendChild(script);
    });

    this.scripts.set(name, { src, promise });
    return promise;
  }
}
