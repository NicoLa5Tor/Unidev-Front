import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type HeroStat = { number: string; label: string; icon: string };

@Component({
  selector: 'app-hero-intro-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-intro-section.component.html',
  styleUrl: './hero-intro-section.component.scss'
})
export class HeroIntroSectionComponent {
  @Input({ required: true }) typedText!: string;
  @Input({ required: true }) stats: HeroStat[] = [];
}
