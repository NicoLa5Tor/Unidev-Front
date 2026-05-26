import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-github-token-guide-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './github-token-guide-dialog.component.html'
})
export class GithubTokenGuideDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<GithubTokenGuideDialogComponent>);
  close(): void { this.dialogRef.close(); }
}
