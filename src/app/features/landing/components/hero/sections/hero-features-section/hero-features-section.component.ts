import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type HeroFeature = { icon: string; title: string; description: string };

@Component({
  selector: 'app-hero-features-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-features-section.component.html',
  styleUrl: './hero-features-section.component.scss'
})
export class HeroFeaturesSectionComponent {
  @Input({ required: true }) features: HeroFeature[] = [];
}
