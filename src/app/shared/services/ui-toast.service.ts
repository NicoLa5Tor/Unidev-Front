import { Injectable, signal } from '@angular/core';

export type UiToastType = 'success' | 'error' | 'info';

export interface UiToastItem {
  id: number;
  type: UiToastType;
  message: string;
  action?: () => void;
  actionLabel?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiToastService {
  readonly toasts = signal<UiToastItem[]>([]);
  private nextId = 1;

  success(message: string): void {
    this.show('success', message, undefined, undefined, 5000);
  }

  error(message: string): void {
    this.show('error', message, undefined, undefined, 5000);
  }

  notify(message: string, action?: () => void, actionLabel = 'Ver'): void {
    this.show('info', message, action, actionLabel, 8000);
  }

  dismiss(id: number): void {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }

  private show(type: UiToastType, message: string, action?: () => void, actionLabel?: string, durationMs = 5000): void {
    const toast: UiToastItem = { id: this.nextId++, type, message, action, actionLabel };
    this.toasts.update(current => [...current, toast].slice(-4));
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }
}
