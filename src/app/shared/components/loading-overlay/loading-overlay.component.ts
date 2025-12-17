import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss'
})
export class LoadingOverlayComponent {
  @Input() show = false;
  @Input() label = 'Procesando...';
  @Input() hint = 'Estamos preparando todo para ti.';
  @Input() logoSrc = 'assets/branding/loader-logo.svg';
  @Input() logoAlt = 'UniDev';
}
