import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { UnicornEmbedConfig } from '../../models/unicorn-embed-config.model';
import { UnicornEmbedService } from '../../services/unicorn-embed.service';

@Component({
  selector: 'app-unicorn-background',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unicorn-background.component.html',
  styleUrl: './unicorn-background.component.scss'
})
export class UnicornBackgroundComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) config?: UnicornEmbedConfig;
  @Input() showOverlay = true;

  @ViewChild('embedHost', { static: true }) private embedHost?: ElementRef<HTMLDivElement>;
  private brandingObserver?: MutationObserver;

  constructor(
    private readonly unicornEmbedService: UnicornEmbedService,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngAfterViewInit(): void {
    this.renderEmbed();
  }

  ngOnDestroy(): void {
    this.brandingObserver?.disconnect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.renderEmbed(true);
    }
  }

  private async renderEmbed(reset = false): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.embedHost || !this.config?.embedHtml) {
      return;
    }

    if (reset) {
      this.embedHost.nativeElement.innerHTML = '';
    }

    this.embedHost.nativeElement.innerHTML = this.config.embedHtml;
    this.observeBranding();

    if (!this.config.scriptUrl) {
      return;
    }

    try {
      await this.unicornEmbedService.initialize(this.config.scriptUrl);
    } catch (error) {
      console.error('No fue posible cargar el script de Unicorn Studio', error);
    }
  }

  private observeBranding(): void {
    this.brandingObserver?.disconnect();

    if (!this.document?.body) {
      return;
    }

    this.brandingObserver = new MutationObserver(() => this.removeBrandingLink());
    this.brandingObserver.observe(this.document.body, { childList: true, subtree: true });

    this.removeBrandingLink();
  }

  private removeBrandingLink(): void {
    const searchRoot = this.embedHost?.nativeElement ?? this.document;
    const brandingLink = searchRoot.querySelector('a[href*="unicorn.studio"]');
    brandingLink?.remove();
  }
}
