import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-intro-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-intro-section.component.html',
  styleUrls: ['./hero-intro-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroIntroSectionComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() typewriterTexts: string[] = [];
  @Input() typewriterActive = false;
  @ViewChild('heroVideo') private heroVideo?: ElementRef<HTMLVideoElement>;

  typedText = '';

  private typingTimeoutId?: number;
  private currentIndex = 0;
  private isDeleting = false;
  private playRetryTimeoutId?: number;
  private readonly isBrowser: boolean;
  private readonly retryVideoPlayback = () => {
    void this.tryStartVideoPlayback();
  };

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.syncTypewriterState();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.setupVideoPlaybackRecovery();
    void this.tryStartVideoPlayback();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['typewriterTexts'] || changes['typewriterActive']) {
      this.syncTypewriterState();
    }
  }

  ngOnDestroy(): void {
    this.clearTypingTimeout();
    this.clearPlayRetryTimeout();
    this.teardownVideoPlaybackRecovery();
  }

  private syncTypewriterState(): void {
    if (!this.typewriterActive) {
      this.clearTypingTimeout();
      this.currentIndex = 0;
      this.isDeleting = false;
      this.typedText = '';
      this.cdr.markForCheck();
      return;
    }

    this.restartTypewriter();
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

  private setupVideoPlaybackRecovery(): void {
    document.addEventListener('visibilitychange', this.retryVideoPlayback);
    window.addEventListener('pageshow', this.retryVideoPlayback);
    window.addEventListener('focus', this.retryVideoPlayback);
    window.addEventListener('pointerdown', this.retryVideoPlayback, { passive: true });
    window.addEventListener('touchstart', this.retryVideoPlayback, { passive: true });
  }

  private teardownVideoPlaybackRecovery(): void {
    if (!this.isBrowser) {
      return;
    }

    document.removeEventListener('visibilitychange', this.retryVideoPlayback);
    window.removeEventListener('pageshow', this.retryVideoPlayback);
    window.removeEventListener('focus', this.retryVideoPlayback);
    window.removeEventListener('pointerdown', this.retryVideoPlayback);
    window.removeEventListener('touchstart', this.retryVideoPlayback);
  }

  private async tryStartVideoPlayback(): Promise<void> {
    if (!this.isBrowser || document.visibilityState === 'hidden') {
      return;
    }

    const video = this.heroVideo?.nativeElement;
    if (!video) {
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', 'true');

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      video.load();
    }

    if (!video.paused) {
      return;
    }

    try {
      await video.play();
      this.clearPlayRetryTimeout();
    } catch {
      this.clearPlayRetryTimeout();
      this.playRetryTimeoutId = window.setTimeout(() => {
        void this.tryStartVideoPlayback();
      }, 900);
    }
  }

  private clearPlayRetryTimeout(): void {
    if (this.playRetryTimeoutId) {
      window.clearTimeout(this.playRetryTimeoutId);
      this.playRetryTimeoutId = undefined;
    }
  }
}
