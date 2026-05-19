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

type SideTab = 'context' | 'proposal';

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
  requestingProposal = false;
  applying = false;
  activeTab: SideTab = 'context';
  requirement: ProjectRequirement;

  private shouldScrollToBottom = false;
  private lastProject: ProjectDetail | null = null;

  constructor(
    private readonly dialogRef: MatDialogRef<RequirementAssistantDialogComponent, ProjectDetail | null>,
    @Inject(MAT_DIALOG_DATA) readonly data: RequirementAssistantDialogData,
    private readonly projectService: ProjectService,
    private readonly uiToastService: UiToastService
  ) {
    this.requirement = data.requirement;
    if (this.requirement.assistantSuggestion) {
      this.activeTab = 'proposal';
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  get isBusy(): boolean {
    return this.sending || this.requestingProposal;
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

  get canRequestProposal(): boolean {
    return !this.isBusy && this.requirement.active && this.messages.length > 0;
  }

  close(): void {
    this.dialogRef.close(this.lastProject);
  }

  send(): void {
    const message = this.prompt.trim();
    if (!message || this.isBusy) return;

    this.sending = true;
    this.shouldScrollToBottom = true;

    this.projectService.sendRequirementAssistantMessage(this.data.projectId, this.requirement.id, { message, requestProposal: false }).subscribe({
      next: project => {
        this.lastProject = project;
        this.requirement = this.findRequirement(project);
        this.prompt = '';
        this.sending = false;
        this.shouldScrollToBottom = true;
        this.resetTextareaHeight();
      },
      error: error => {
        this.sending = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos consultar la IA para este requerimiento.'));
      }
    });
  }

  askForProposal(): void {
    if (this.isBusy || !this.requirement.active) return;

    this.requestingProposal = true;
    this.shouldScrollToBottom = true;

    const syntheticMessage = 'Genera una propuesta estructurada basada en nuestra conversación.';
    this.projectService.sendRequirementAssistantMessage(this.data.projectId, this.requirement.id, { message: syntheticMessage, requestProposal: true }).subscribe({
      next: project => {
        this.lastProject = project;
        this.requirement = this.findRequirement(project);
        this.requestingProposal = false;
        this.shouldScrollToBottom = true;
        this.activeTab = 'proposal';
        this.uiToastService.success('La IA generó una propuesta. Revísala y aplícala cuando quieras.');
      },
      error: error => {
        this.requestingProposal = false;
        this.uiToastService.error(this.resolveErrorMessage(error, 'No pudimos generar la propuesta.'));
      }
    });
  }

  applySuggestion(): void {
    if (!this.canApplySuggestion) return;

    this.applying = true;
    this.projectService.applyRequirementAssistantSuggestion(this.data.projectId, this.requirement.id).subscribe({
      next: project => {
        this.applying = false;
        this.uiToastService.success('Propuesta aplicada. La estimación del proyecto se actualizó.');
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
