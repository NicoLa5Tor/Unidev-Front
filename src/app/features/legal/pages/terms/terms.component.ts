import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../../landing/components/footer/footer.component';

interface TocItem {
  id: string;
  label: string;
}

interface Chapter {
  num: number;
  roman: string;
  title: string;
  sections: TocItem[];
}

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

  activeChapter = 1;

  readonly chapters: Chapter[] = [
    {
      num: 1,
      roman: 'I',
      title: 'Disposiciones generales de la plataforma',
      sections: [
        { id: 'marco-normativo', label: '1. Marco normativo aplicable' },
        { id: 'responsables', label: 'Responsables de la plataforma' },
        { id: 'naturaleza-unidev', label: '2. Naturaleza de UNIDEV' },
        { id: 'objeto', label: '3. Objeto de los Términos y Condiciones' },
        { id: 'definiciones', label: '4. Definiciones' },
        { id: 'aceptacion-digital', label: '5. Aceptación digital' },
        { id: 'independencia-servicios', label: '6. Independencia de los servicios' },
        { id: 'prohibicion-intermediacion', label: '7. Prohibición de intermediación laboral indebida' },
      ],
    },
    {
      num: 2,
      roman: 'II',
      title: 'Términos para empresas clientes o contratantes',
      sections: [
        { id: 'marco-normativo-empresas', label: 'Marco normativo' },
        { id: 'registro-empresas', label: '8. Registro de empresas' },
        { id: 'obligaciones-empresa', label: '9. Obligaciones de la empresa' },
        { id: 'empresas-publicas', label: '10. Empresas públicas y entidades estatales' },
        { id: 'terminos-empresas', label: '11. Términos y Condiciones de las Empresas' },
        { id: 'publicacion-proyecto', label: '12. Publicación del proyecto' },
        { id: 'proteccion-estudiante', label: '13. Protección del estudiante prestador' },
        { id: 'derecho-pago', label: '14. Derecho al pago del estudiante' },
        { id: 'pago-previo', label: '15. Pago previo y retención operativa' },
        { id: 'revision-entregable', label: '16. Revisión del entregable' },
        { id: 'ajustes-correcciones', label: '17. Ajustes y correcciones' },
        { id: 'uso-entregable', label: '18. Uso empresarial del entregable' },
        { id: 'prohibicion-contacto', label: '19. Prohibición de contacto externo' },
      ],
    },
    {
      num: 3,
      roman: 'III',
      title: 'Términos para estudiantes prestadores',
      sections: [
        { id: 'marco-normativo-estudiantes', label: 'Marco normativo' },
        { id: 'registro-estudiante', label: '19. Registro del estudiante' },
        { id: 'naturaleza-estudiante', label: '20. Naturaleza independiente' },
        { id: 'obligaciones-estudiante', label: '21. Obligaciones del estudiante' },
        { id: 'etica-estudiante', label: '22. Ética profesional' },
        { id: 'propiedad-intelectual', label: '23. Propiedad intelectual' },
        { id: 'componentes-previos', label: '24. Componentes previos y código abierto' },
        { id: 'confidencialidad-estudiante', label: '25. Confidencialidad' },
        { id: 'pago-estudiante', label: '26. Pago al estudiante' },
        { id: 'comision-estudiante', label: '27. Comisión o tarifa aplicable' },
        { id: 'seguridad-social', label: '28. Seguridad social y tributario' },
      ],
    },
    {
      num: 4,
      roman: 'IV',
      title: 'Términos para UNIDEV como plataforma facilitadora',
      sections: [
        { id: 'marco-normativo-unidev', label: 'Marco normativo' },
        { id: 'rol-unidev', label: '29. Rol de UNIDEV' },
        { id: 'eximentes-responsabilidad', label: '30. Eximentes y limitaciones' },
        { id: 'no-garantia', label: '31. No garantía de resultado' },
        { id: 'verificacion-limitada', label: '32. Verificación limitada' },
        { id: 'comision-empresa', label: '33. Comisión de plataforma a la empresa' },
        { id: 'comision-plataforma-estudiante', label: '34. Comisión de plataforma al estudiante' },
      ],
    },
    {
      num: 5,
      roman: 'V',
      title: 'Sistema de pagos, retención y liberación',
      sections: [
        { id: 'marco-normativo-pagos', label: 'Marco normativo' },
        { id: 'medio-pago', label: '35. Medio de pago' },
        { id: 'pago-empresa', label: '36. Pago de la empresa' },
        { id: 'retencion-condicionada', label: '37. Retención condicionada' },
        { id: 'liberacion-pago', label: '38. Liberación del pago' },
        { id: 'no-liberacion', label: '39. No liberación temporal' },
        { id: 'devoluciones', label: '40. Devoluciones a la empresa' },
        { id: 'reversion-pago', label: '41. Reversión del pago' },
        { id: 'derecho-retracto', label: '42. Derecho de retracto' },
        { id: 'impuestos-retenciones', label: '43. Impuestos, retenciones y soportes' },
      ],
    },
    {
      num: 6,
      roman: 'VI',
      title: 'Términos para universidades y roles académicos',
      sections: [
        { id: 'marco-normativo-universidades', label: 'Marco normativo' },
        { id: 'definiciones-universidad', label: '44. Definiciones del capítulo' },
        { id: 'registro-universidad', label: '45. Registro de la Universidad' },
        { id: 'vinculacion-dominio', label: '46. Vinculación automática por dominio' },
        { id: 'roles-academicos', label: '47. Roles académicos' },
        { id: 'responsabilidades-universidad', label: '48. Responsabilidades de la Universidad' },
        { id: 'inhabilitacion-universidad', label: '49. Inhabilitación de la Universidad' },
        { id: 'limites-responsabilidad-universidad', label: '50. Límites de responsabilidad de UNIDEV' },
      ],
    },
  ];

  get activeChapterData(): Chapter | undefined {
    return this.chapters.find(c => c.num === this.activeChapter);
  }

  setChapter(num: number): void {
    this.activeChapter = num;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
