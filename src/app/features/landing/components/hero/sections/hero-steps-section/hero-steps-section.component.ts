import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

export type HeroReason = {
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export type HeroStep = {
  phase: string;
  title: string;
  description: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeLabel: string;
  afterLabel: string;
};

@Component({
  selector: 'app-hero-steps-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-steps-section.component.html',
  styleUrls: ['./hero-steps-section.component.scss']
})
export class HeroStepsSectionComponent implements OnChanges {
  @Input({ required: true }) reasons: HeroReason[] = [];
  @Input({ required: true }) steps: HeroStep[] = [];

  imageColumns: HeroReason[][] = [];
  spotlightReason?: HeroReason;

  ngOnChanges(): void {
    this.rebuildLayoutData();
  }

  private rebuildLayoutData(): void {
    if (this.reasons.length === 0) {
      this.imageColumns = [];
      this.spotlightReason = undefined;
      return;
    }

    const safe = (index: number) => this.reasons[index % this.reasons.length];

    this.imageColumns = [
      [safe(0), safe(1)],
      [safe(2), safe(3)],
      [safe(4), safe(5)]
    ];

    this.spotlightReason = safe(2);
  }
}
