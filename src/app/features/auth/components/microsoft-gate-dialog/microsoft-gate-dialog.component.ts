import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-microsoft-gate-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './microsoft-gate-dialog.component.html',
  styleUrl: './microsoft-gate-dialog.component.scss'
})
export class MicrosoftGateDialogComponent {
  readonly emailControl = new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true });

  constructor(private readonly dialogRef: MatDialogRef<MicrosoftGateDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }

  register(): void {
    const normalizedEmail = this.emailControl.value.trim().toLowerCase();
    if (!normalizedEmail) {
      this.emailControl.setErrors({ required: true });
    }

    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }

    this.dialogRef.close({ action: 'register', email: normalizedEmail });
  }
}
