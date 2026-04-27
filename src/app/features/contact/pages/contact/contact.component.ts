import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../../landing/components/footer/footer.component';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  readonly channels = [
    {
      label: 'General',
      email: 'nicolas@unidev.site',
      description: 'Consultas generales, alianzas y acompañamiento operativo.',
      href: 'mailto:nicolas@unidev.site'
    },
    {
      label: 'Empresas',
      email: 'nicolas@unidev.site',
      description: 'Registro empresarial, proyectos y publicación de oportunidades.',
      href: 'mailto:nicolas@unidev.site'
    },
    {
      label: 'Universidades',
      email: 'nicolas@unidev.site',
      description: 'Alta institucional, dominios .edu.co y activación académica.',
      href: 'mailto:nicolas@unidev.site'
    }
  ];
}
