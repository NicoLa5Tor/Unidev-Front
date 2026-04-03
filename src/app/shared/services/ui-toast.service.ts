import { Injectable, signal } from '@angular/core';

export type UiToastType = 'success' | 'error';

export interface UiToastItem {
  id: number;
  type: UiToastType;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiToastService {
  readonly toasts = signal<UiToastItem[]>([]);
  private nextId = 1;

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  dismiss(id: number): void {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }

  private show(type: UiToastType, message: string): void {
    const toast: UiToastItem = {
      id: this.nextId++,
      type,
      message
    };

    this.toasts.update(current => [...current, toast].slice(-4));
    setTimeout(() => this.dismiss(toast.id), 5000);
  }
}
