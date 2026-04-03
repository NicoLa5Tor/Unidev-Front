import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { UiToastService } from '../../services/ui-toast.service';

@Component({
  selector: 'app-ui-toast-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-toast-stack.component.html',
  styleUrl: './ui-toast-stack.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiToastStackComponent {
  constructor(public readonly toastService: UiToastService) {}

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
