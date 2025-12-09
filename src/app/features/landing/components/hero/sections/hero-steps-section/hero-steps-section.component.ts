import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type HeroStep = { title: string; description: string };

@Component({
  selector: 'app-hero-steps-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-steps-section.component.html',
  styleUrl: './hero-steps-section.component.scss'
})
export class HeroStepsSectionComponent {
  @Input({ required: true }) steps: HeroStep[] = [];
}
