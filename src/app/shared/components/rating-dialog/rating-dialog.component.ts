import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface RatingDialogData {
  projectName: string;
  devName: string;
}

export interface RatingDialogResult {
  score: number;
  comment: string | null;
}

@Component({
  selector: 'app-rating-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="rd">
      <!-- Header -->
      <div class="rd__header">
        <div class="rd__icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
        </div>
        <div class="rd__header-text">
          <p class="rd__eyebrow">CALIFICAR TRABAJO</p>
          <h2 class="rd__title">{{ data.projectName }}</h2>
        </div>
        <button type="button" class="rd__close" (click)="cancel()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Divider -->
      <div class="rd__divider"></div>

      <!-- Body -->
      <div class="rd__body">
        <!-- Dev label -->
        <p class="rd__dev-label">Desarrollador / equipo</p>
        <p class="rd__dev-name">{{ data.devName }}</p>

        <!-- Stars -->
        <div class="rd__stars-wrap">
          <div class="rd__stars">
            <button *ngFor="let star of stars" type="button"
              (click)="setScore(star)"
              (mouseenter)="hovered = star"
              (mouseleave)="hovered = 0"
              [class.rd__star--active]="star <= (hovered || score)"
              [class.rd__star--hovered]="star <= hovered && hovered > 0"
              class="rd__star">
              <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
            </button>
          </div>
          <p class="rd__score-label" [class.rd__score-label--visible]="(hovered || score) > 0">
            {{ scoreLabel }}
          </p>
        </div>

        <!-- Comment -->
        <div class="rd__textarea-wrap">
          <textarea
            [(ngModel)]="comment"
            placeholder="Deja un comentario sobre el trabajo realizado (opcional)..."
            maxlength="1000"
            rows="3"
            class="rd__textarea">
          </textarea>
          <span class="rd__char-count">{{ comment.length }}/1000</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="rd__actions">
        <button type="button" class="rd__btn rd__btn--ghost" (click)="cancel()">Cancelar</button>
        <button type="button" class="rd__btn rd__btn--primary" [disabled]="score === 0" (click)="confirm()">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
          </svg>
          Enviar calificación
        </button>
      </div>
    </div>
  `,
  styles: [`
    .rd {
      background: color-mix(in srgb, var(--panel, #13131f) 100%, transparent 0%);
      background-color: #13131f;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      overflow: hidden;
      min-width: 420px;
      max-width: 92vw;
      box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
    }

    /* Header */
    .rd__header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 24px 24px 20px;
    }
    .rd__icon {
      flex-shrink: 0;
      width: 42px; height: 42px;
      border-radius: 12px;
      background: rgba(251,191,36,0.12);
      border: 1px solid rgba(251,191,36,0.25);
      color: #fbbf24;
      display: flex; align-items: center; justify-content: center;
    }
    .rd__header-text { flex: 1; min-width: 0; }
    .rd__eyebrow {
      font-family: var(--font-tech, monospace);
      font-size: 10px;
      letter-spacing: 0.22em;
      color: #fbbf24;
      margin: 0 0 4px;
      opacity: 0.85;
    }
    .rd__title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text, #e2e8f0);
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rd__close {
      flex-shrink: 0;
      width: 28px; height: 28px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04);
      color: var(--muted, #94a3b8);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .rd__close:hover { background: rgba(255,255,255,0.1); color: var(--text, #e2e8f0); }

    /* Divider */
    .rd__divider { height: 1px; background: rgba(255,255,255,0.06); }

    /* Body */
    .rd__body { padding: 20px 24px; }

    .rd__dev-label {
      font-family: var(--font-tech, monospace);
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--muted, #94a3b8);
      margin: 0 0 4px;
    }
    .rd__dev-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text, #e2e8f0);
      margin: 0 0 20px;
    }

    /* Stars */
    .rd__stars-wrap {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .rd__stars { display: flex; gap: 4px; margin-bottom: 10px; }
    .rd__star {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: rgba(251,191,36,0.15);
      transition: color 0.12s, transform 0.1s;
      line-height: 0;
    }
    .rd__star:hover { transform: scale(1.12); }
    .rd__star--active { color: #fbbf24; }
    .rd__star--hovered { transform: scale(1.1); }
    .rd__score-label {
      font-size: 12px;
      font-weight: 500;
      color: var(--muted, #94a3b8);
      margin: 0;
      min-height: 18px;
      transition: color 0.15s;
    }
    .rd__score-label--visible { color: #fbbf24; }

    /* Textarea */
    .rd__textarea-wrap { position: relative; }
    .rd__textarea {
      width: 100%;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.03);
      color: var(--text, #e2e8f0);
      padding: 12px 14px 28px;
      font-size: 13px;
      line-height: 1.6;
      resize: none;
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .rd__textarea::placeholder { color: rgba(148,163,184,0.5); }
    .rd__textarea:focus { border-color: rgba(255,255,255,0.16); background: rgba(255,255,255,0.04); }
    .rd__char-count {
      position: absolute;
      bottom: 10px; right: 12px;
      font-size: 10px;
      color: var(--muted, #94a3b8);
      opacity: 0.6;
      pointer-events: none;
    }

    /* Actions */
    .rd__actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding: 12px 24px 20px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .rd__btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px;
      border-radius: 12px;
      font-family: var(--font-tech, monospace);
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid transparent;
    }
    .rd__btn--ghost {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.08);
      color: var(--muted, #94a3b8);
    }
    .rd__btn--ghost:hover { background: rgba(255,255,255,0.08); color: var(--text, #e2e8f0); }
    .rd__btn--primary {
      background: rgba(251,191,36,0.12);
      border-color: rgba(251,191,36,0.35);
      color: #fbbf24;
    }
    .rd__btn--primary:hover:not(:disabled) { background: rgba(251,191,36,0.2); }
    .rd__btn--primary:disabled { opacity: 0.35; cursor: not-allowed; }
  `]
})
export class RatingDialogComponent {
  stars = [1, 2, 3, 4, 5];
  score = 0;
  hovered = 0;
  comment = '';

  constructor(
    private readonly dialogRef: MatDialogRef<RatingDialogComponent, RatingDialogResult>,
    @Inject(MAT_DIALOG_DATA) readonly data: RatingDialogData
  ) {}

  get scoreLabel(): string {
    const s = this.hovered || this.score;
    switch (s) {
      case 1: return 'Muy malo';
      case 2: return 'Regular';
      case 3: return 'Bueno';
      case 4: return 'Muy bueno';
      case 5: return 'Excelente';
      default: return 'Selecciona una puntuación';
    }
  }

  setScore(s: number): void { this.score = s; }
  cancel(): void { this.dialogRef.close(); }
  confirm(): void {
    if (this.score === 0) return;
    this.dialogRef.close({ score: this.score, comment: this.comment.trim() || null });
  }
}
