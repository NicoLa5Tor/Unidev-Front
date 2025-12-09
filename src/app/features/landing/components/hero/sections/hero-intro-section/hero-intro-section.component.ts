import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';

export type HeroStat = { number: string; label: string; icon: string };

@Component({
  selector: 'app-hero-intro-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-intro-section.component.html',
  styleUrl: './hero-intro-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroIntroSectionComponent implements OnInit, OnDestroy, OnChanges {
  @Input({ required: true }) stats: HeroStat[] = [];
  @Input() typewriterTexts: string[] = [];

  typedText = '';

  private typingTimeoutId?: number;
  private currentIndex = 0;
  private isDeleting = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.restartTypewriter();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['typewriterTexts'] && !changes['typewriterTexts'].firstChange) {
      this.restartTypewriter();
    }
  }

  ngOnDestroy(): void {
    this.clearTypingTimeout();
  }

  private restartTypewriter(): void {
    this.clearTypingTimeout();
    this.currentIndex = 0;
    this.isDeleting = false;

    if (!this.typewriterTexts?.length) {
      this.typedText = '';
      this.cdr.markForCheck();
      return;
    }

    this.queueNextStep();
  }

  private queueNextStep(): void {
    const texts = this.typewriterTexts;
    if (!texts.length) {
      return;
    }

    const fullText = texts[this.currentIndex] ?? '';
    const nextText = this.isDeleting
      ? fullText.substring(0, this.typedText.length - 1)
      : fullText.substring(0, this.typedText.length + 1);

    this.typedText = nextText;
    this.cdr.markForCheck();

    let delay = this.isDeleting ? 45 : 120;

    if (!this.isDeleting && nextText === fullText) {
      delay = 1600;
      this.isDeleting = true;
    } else if (this.isDeleting && nextText === '') {
      this.isDeleting = false;
      this.currentIndex = (this.currentIndex + 1) % texts.length;
      delay = 260;
    }

    this.typingTimeoutId = window.setTimeout(() => this.queueNextStep(), delay);
  }

  private clearTypingTimeout(): void {
    if (this.typingTimeoutId) {
      window.clearTimeout(this.typingTimeoutId);
      this.typingTimeoutId = undefined;
    }
  }
}
