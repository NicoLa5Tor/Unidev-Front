import { Component, Input, Output, EventEmitter, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../../core/services/animation.service';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent implements AfterViewInit {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() animate: boolean = true; // Enable/disable animations

  @Output() clicked = new EventEmitter<void>();

  constructor(
    private animationService: AnimationService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit(): void {
    if (this.animate) {
      this.setupAnimations();
    }
  }

  onClick(): void {
    if (!this.disabled && !this.loading) {
      if (this.animate) {
        this.animationService.scaleIn(this.elementRef.nativeElement.querySelector('button'), 200);
      }
      this.clicked.emit();
    }
  }

  private setupAnimations(): void {
    const buttonElement = this.elementRef.nativeElement.querySelector('button');
    
    if (buttonElement) {
      // Initial fade in animation
      this.animationService.fadeIn(buttonElement, 500);

      // Hover animations
      buttonElement.addEventListener('mouseenter', () => {
        if (!this.disabled && !this.loading) {
          this.animationService.buttonHover(buttonElement);
        }
      });

      buttonElement.addEventListener('mouseleave', () => {
        if (!this.disabled && !this.loading) {
          this.animationService.buttonHoverOut(buttonElement);
        }
      });
    }
  }
}
