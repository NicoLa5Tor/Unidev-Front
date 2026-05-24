import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../../landing/components/footer/footer.component';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  readonly version = '1.0';
  readonly effectiveDate = '23 de mayo de 2026';

  readonly sections = [
    { id: 'responsable',    label: '1. Responsable del tratamiento' },
    { id: 'datos',          label: '2. Datos que se recopilan' },
    { id: 'finalidad',      label: '3. Finalidad del tratamiento' },
    { id: 'base-legal',     label: '4. Base legal' },
    { id: 'terceros',       label: '5. Terceros que intervienen' },
    { id: 'transferencia',  label: '6. Transferencia de datos' },
    { id: 'retencion',      label: '7. Tiempo de retención' },
    { id: 'derechos',       label: '8. Derechos del titular' },
    { id: 'seguridad',      label: '9. Seguridad de los datos' },
    { id: 'cookies',        label: '10. Cookies y navegación' },
    { id: 'menores',        label: '11. Menores de edad' },
    { id: 'modificaciones', label: '12. Modificaciones' },
    { id: 'contacto',       label: '13. Contacto' },
  ];

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
