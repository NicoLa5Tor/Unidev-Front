import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../../core/services/animation.service';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  template: `
    <div class="loader-container" [ngClass]="{'centered': centered}">
      <div class="spinner" [ngClass]="size"></div>
      <div *ngIf="message" class="loader-message">{{ message }}</div>
    </div>
  `,
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements AfterViewInit {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message?: string;
  @Input() centered: boolean = true;

  constructor(
    private animationService: AnimationService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit(): void {
    const spinner = this.elementRef.nativeElement.querySelector('.spinner');
    if (spinner) {
      this.animationService.loadingSpinner(spinner);
    }

    const message = this.elementRef.nativeElement.querySelector('.loader-message');
    if (message) {
      this.animationService.fadeIn(message, 600);
    }
  }
}