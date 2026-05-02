import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface MessageDialogData {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'info' | 'success' | 'error';
  supportText?: string;
  autoCloseMs?: number;
  showActions?: boolean;
}

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './message-dialog.component.html',
  styleUrl: './message-dialog.component.scss'
})
export class MessageDialogComponent implements OnInit, OnDestroy {
  private autoCloseHandle?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: MessageDialogData
  ) {}

  ngOnInit(): void {
    const autoClose = this.autoCloseMs;
    if (autoClose) {
      this.autoCloseHandle = setTimeout(() => this.close(), autoClose);
    }
  }

  ngOnDestroy(): void {
    if (this.autoCloseHandle) {
      clearTimeout(this.autoCloseHandle);
    }
  }

  get type(): 'info' | 'success' | 'error' {
    return this.data.type ?? 'info';
  }

  get badgeLabel(): string {
    switch (this.type) {
      case 'success':
        return 'OK';
      case 'error':
        return '!';
      default:
        return 'i';
    }
  }

  get supportText(): string | null {
    if (this.data.supportText) {
      return this.data.supportText;
    }

    switch (this.type) {
      case 'success':
        return 'Todo salió bien';
      case 'error':
        return 'Algo no salió como esperábamos';
      default:
        return 'Acción requerida para continuar';
    }
  }

  get showActions(): boolean {
    if (typeof this.data.showActions === 'boolean') {
      return this.data.showActions;
    }
    // If there's a cancel label, always show actions (it's a confirm/retry dialog)
    if (this.data.cancelLabel) {
      return true;
    }
    return this.type !== 'error';
  }

  get autoCloseMs(): number | null {
    if (typeof this.data.autoCloseMs === 'number') {
      return this.data.autoCloseMs;
    }
    // Don't auto-close if it's a confirm dialog (has cancelLabel)
    if (this.data.cancelLabel) {
      return null;
    }
    return this.type === 'error' ? 4200 : null;
  }

  confirm(): void {
    this.dialogRef.close(true);
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
