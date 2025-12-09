import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  isMenuOpen = false;
  
  navItems = [
    { label: 'Inicio', href: '#home', active: true },
    { label: 'Proyectos', href: '#projects' },
    { label: 'Empresas', href: '#companies' },
    { label: 'Estudiantes', href: '#students' },
    { label: 'Contacto', href: '#contact' }
  ];

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  setActiveNav(index: number): void {
    this.navItems.forEach((item, i) => {
      item.active = i === index;
    });
  }
}
