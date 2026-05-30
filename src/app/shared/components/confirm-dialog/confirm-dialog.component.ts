import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' = red accent (destructive), 'primary' = accent-3, default 'primary' */
  variant?: 'danger' | 'primary';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent, boolean>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}

  get isDanger(): boolean {
    return this.data.variant === 'danger';
  }

  cancel(): void { this.dialogRef.close(false); }
  confirm(): void { this.dialogRef.close(true); }
}
