import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { StudentService } from '../../../features/universities/services/student.service';
import { PaymentService } from '../../../features/companies/services/payment.service';
import { UiToastService } from '../../services/ui-toast.service';
import { ProjectApplication } from '../../models/student.model';

@Component({
  selector: 'app-certificate-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-modal.component.html'
})
export class CertificateModalComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly paymentService = inject(PaymentService);
  private readonly toast = inject(UiToastService);
  private readonly dialogRef = inject(MatDialogRef<CertificateModalComponent>);

  allApplications: ProjectApplication[] = [];
  filteredApplications: ProjectApplication[] = [];
  selectedIds = new Set<number>();
  releasedProjectIds = new Set<number>();

  filter: 'all' | 'released' = 'all';
  isLoading = true;
  isDownloading = false;

  ngOnInit(): void {
    this.studentService.listMyApplications().subscribe({
      next: apps => {
        this.allApplications = apps.filter(a => a.status === 'ACCEPTED');
        this.isLoading = false;
        this.applyFilter();
        this.loadPaymentStatuses();
      },
      error: () => {
        this.toast.error('No se pudieron cargar los proyectos');
        this.isLoading = false;
      }
    });
  }

  private loadPaymentStatuses(): void {
    const uniqueProjectIds = [...new Set(this.allApplications.map(a => a.projectId))];
    uniqueProjectIds.forEach(pid => {
      this.paymentService.getSellerPaymentStatus(pid).subscribe({
        next: payment => {
          if (payment?.status === 'RELEASED') {
            this.releasedProjectIds.add(pid);
            this.applyFilter();
          }
        },
        error: () => {}
      });
    });
  }

  setFilter(f: 'all' | 'released'): void {
    this.filter = f;
    this.applyFilter();
    this.selectedIds.clear();
  }

  private applyFilter(): void {
    this.filteredApplications = this.filter === 'released'
      ? this.allApplications.filter(a => this.releasedProjectIds.has(a.projectId))
      : [...this.allApplications];
  }

  toggleAll(checked: boolean): void {
    if (checked) {
      this.filteredApplications.forEach(a => this.selectedIds.add(a.id));
    } else {
      this.selectedIds.clear();
    }
  }

  toggleOne(id: number, checked: boolean): void {
    checked ? this.selectedIds.add(id) : this.selectedIds.delete(id);
  }

  get allChecked(): boolean {
    return this.filteredApplications.length > 0 &&
      this.filteredApplications.every(a => this.selectedIds.has(a.id));
  }

  get someChecked(): boolean {
    return this.selectedIds.size > 0 && !this.allChecked;
  }

  isReleased(app: ProjectApplication): boolean {
    return this.releasedProjectIds.has(app.projectId);
  }

  download(): void {
    if (this.selectedIds.size === 0 || this.isDownloading) return;
    this.isDownloading = true;
    this.studentService.downloadCertificate(Array.from(this.selectedIds)).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'certificado-unidev.pdf';
        a.click();
        URL.revokeObjectURL(url);
        this.isDownloading = false;
        this.dialogRef.close();
      },
      error: () => {
        this.toast.error('No se pudo generar el certificado');
        this.isDownloading = false;
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
