import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-deployment-info-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deployment-info-dialog.component.html'
})
export class DeploymentInfoDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<DeploymentInfoDialogComponent>);
  close(): void { this.dialogRef.close(); }
}
