import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { StudentService } from '../../../features/universities/services/student.service';
import { UiToastService } from '../../services/ui-toast.service';
import { TeamMessage } from '../../models/student.model';

export interface TeamChatDialogData {
  teamId: number;
  teamName: string;
  currentUserId: number;
}

const POLL_INTERVAL_MS = 4000;

@Component({
  selector: 'app-team-chat-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './team-chat-dialog.component.html'
})
export class TeamChatDialogComponent implements OnDestroy {
  isLoading = true;
  sending = false;
  messages: TeamMessage[] = [];
  draft = '';
  private pollHandle: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly dialogRef: MatDialogRef<TeamChatDialogComponent>,
    @Inject(MAT_DIALOG_DATA) readonly data: TeamChatDialogData,
    private readonly studentService: StudentService,
    private readonly toast: UiToastService
  ) {
    this.loadMessages();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  close(): void {
    this.dialogRef.close();
  }

  isOwn(msg: TeamMessage): boolean {
    return msg.senderUserId === this.data.currentUserId;
  }

  get canSend(): boolean {
    return this.draft.trim().length > 0 && !this.sending;
  }

  onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (!ke.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  send(): void {
    if (!this.canSend) return;
    this.sending = true;
    this.studentService.sendTeamMessage(this.data.teamId, { message: this.draft.trim() }).subscribe({
      next: msg => {
        this.messages = [...this.messages, msg];
        this.draft = '';
        this.sending = false;
        this.scheduleNextPoll();
      },
      error: err => {
        this.sending = false;
        this.toast.error(err?.error?.message || 'No se pudo enviar el mensaje');
      }
    });
  }

  refresh(): void {
    this.studentService.getTeamMessages(this.data.teamId).subscribe({
      next: msgs => { this.messages = msgs; this.scheduleNextPoll(); },
      error: () => { this.scheduleNextPoll(); }
    });
  }

  private loadMessages(): void {
    this.isLoading = true;
    this.studentService.getTeamMessages(this.data.teamId).subscribe({
      next: msgs => {
        this.messages = msgs;
        this.isLoading = false;
        this.scheduleNextPoll();
      },
      error: err => {
        this.isLoading = false;
        this.toast.error(err?.error?.message || 'No se pudieron cargar los mensajes');
        this.dialogRef.close();
      }
    });
  }

  private scheduleNextPoll(): void {
    this.stopPolling();
    this.pollHandle = setTimeout(() => this.refresh(), POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.pollHandle != null) {
      clearTimeout(this.pollHandle);
      this.pollHandle = null;
    }
  }
}
