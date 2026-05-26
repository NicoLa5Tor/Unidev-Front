import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnDestroy
} from '@angular/core';

import { UiToastItem, UiToastService } from '../../services/ui-toast.service';

@Component({
  selector: 'app-ui-toast-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-toast-stack.component.html',
  styleUrl: './ui-toast-stack.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Disable view encapsulation so the host element style works once we move it to body
  host: { 'data-toast-host': '' }
})
export class UiToastStackComponent implements AfterViewInit, OnDestroy {
  constructor(
    public readonly toastService: UiToastService,
    private readonly host: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngAfterViewInit(): void {
    // Teleport the host element to <body> so it lives outside any parent stacking
    // context. Combined with z-index 10000, this guarantees toasts always sit on
    // top of Angular Material / CDK overlays (default z-index 1000).
    const el = this.host.nativeElement;
    if (el.parentElement !== this.document.body) {
      this.document.body.appendChild(el);
    }
  }

  ngOnDestroy(): void {
    const el = this.host.nativeElement;
    if (el.parentElement === this.document.body) {
      this.document.body.removeChild(el);
    }
  }

  handleClick(toast: UiToastItem): void {
    if (toast.action) {
      toast.action();
    }
    this.toastService.dismiss(toast.id);
  }
}
