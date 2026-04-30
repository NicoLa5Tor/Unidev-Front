import { AfterViewChecked, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { ProjectService } from '../../services/project.service';
import {
  ProjectDetail,
  ProjectRequirement,
  ProjectRequirementAssistantMessage
} from '../../../../shared/models/project.model';
import { UiToastService } from '../../../../shared/services/ui-toast.service';

export interface RequirementAssistantDialogData {
  projectId: number;
  requirement: ProjectRequirement;
  requirementIndex?: number;
}

@Component({
  selector: 'app-requirement-assistant-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './requirement-assistant-dialog.component.html',
  styleUrl: './requirement-assistant-dialog.component.scss'
})
export class RequirementAssistantDialogComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLElement>;
  @ViewChild('promptTextarea') private promptTextarea!: ElementRef<HTMLTextAreaElement>;

  prompt = '';
  sending = false;
  applying = false;
  proposalExpanded = false;
  requirement: ProjectRequirement;

  private shouldScrollToBottom = false;

  constructor(
    private readonly dialogRef: MatDialogRef<RequirementAssistantDialogComponent, ProjectDetail | null>,
    @Inject(MAT_DIALOG_DATA) readonly data: RequirementAssistantDialogData,
    private readonly projectService: ProjectService,
    private readonly uiToastService: UiToastService
  ) {
    this.requirement = data.requirement;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  get canApplySuggestion(): boolean {
    return !!this.requirement.assistantSuggestion && !this.applying && this.requirement.active;
  }

  get messages(): ProjectRequirementAssistantMessage[] {
    return this.requirement.assistantMessages ?? [];
  }

  get requirementDisplayLabel(): string {
    const index = this.data.requirementIndex ?? -1;
    return index >= 0 ? `Requerimiento ${index + 1}` : 'Requerimiento';
  }

  close(): void {
    this.dialogRef.close(null);
  }

  send(): void {
    const message = this.prompt.trim();
    if (!message || this.sending) return;

    this.sending = true;
    this.shouldScrollToBottom = true;

    this.projectService.sendRequirementAssistantMessage(this.data.projectId, this.requirement.id, { message }).subscribe({
      next: project => {
        this.requirement = this.findRequirement(project);
        this.prompt = '';
        this.sending = false;
        this.shouldScrollToBottom = true;
        this.resetTextareaHeight();
        this.proposalExpanded = true;
        this.uiToastService.success('La IA respondió y dejó una propuesta actualizada para este requerimiento.');
      },
      error: error => {
        this.sending = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos consultar la IA para este requerimiento.'));
      }
    });
  }

  applySuggestion(): void {
    if (!this.canApplySuggestion) return;

    this.applying = true;
    this.projectService.applyRequirementAssistantSuggestion(this.data.projectId, this.requirement.id).subscribe({
      next: project => {
        this.applying = false;
        this.uiToastService.success('La propuesta de la IA se aplicó y el proyecto ya está reestimándose.');
        this.dialogRef.close(project);
      },
      error: error => {
        this.applying = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos aplicar la propuesta sugerida.'));
      }
    });
  }

  onEnterKey(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }

  trackMessage(_: number, message: ProjectRequirementAssistantMessage): number {
    return message.id;
  }

  private resetTextareaHeight(): void {
    try {
      const el = this.promptTextarea?.nativeElement;
      if (el) el.style.height = 'auto';
    } catch { /* noop */ }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch { /* noop */ }
  }

  private findRequirement(project: ProjectDetail): ProjectRequirement {
    return project.requirements.find(r => r.id === this.requirement.id) ?? this.requirement;
  }

  private resolveErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { message?: string }; message?: string })?.error?.message
      ?? (error as { message?: string })?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }
}
