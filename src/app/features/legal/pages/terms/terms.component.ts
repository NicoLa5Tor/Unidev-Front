import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../../landing/components/footer/footer.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss'
})
export class TermsComponent {
  readonly version = '1.0';
  readonly effectiveDate = '23 de mayo de 2026';

  readonly sections = [
    { id: 'identificacion', label: '1. Identificación del titular' },
    { id: 'definiciones', label: '2. Definiciones' },
    { id: 'roles', label: '3. Roles y acceso' },
    { id: 'intermediacion', label: '4. Modelo de intermediación' },
    { id: 'comisiones', label: '5. Comisiones y pagos' },
    { id: 'propiedad', label: '6. Propiedad intelectual' },
    { id: 'entrega', label: '7. Entrega y aprobación' },
    { id: 'disputas', label: '8. Disputas y devoluciones' },
    { id: 'responsabilidad', label: '9. Limitación de responsabilidad' },
    { id: 'uso', label: '10. Uso aceptable' },
    { id: 'terminos-organizaciones', label: '11. Términos de Organizaciones' },
    { id: 'suspension', label: '12. Suspensión y cancelación' },
    { id: 'modificaciones', label: '13. Modificaciones' },
    { id: 'ley', label: '14. Ley aplicable' },
    { id: 'intermediacion-pagos', label: '15. Intermediación de pagos' },
    { id: 'contacto', label: '16. Contacto' },
  ];

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
