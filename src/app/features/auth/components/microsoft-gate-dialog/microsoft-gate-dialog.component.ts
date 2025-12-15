import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-microsoft-gate-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './microsoft-gate-dialog.component.html',
  styleUrl: './microsoft-gate-dialog.component.scss'
})
export class MicrosoftGateDialogComponent {
  constructor(private readonly dialogRef: MatDialogRef<MicrosoftGateDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  register(email: string): void {
    this.dialogRef.close({ action: 'register', email });
  }
}
