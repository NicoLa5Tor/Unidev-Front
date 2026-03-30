import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { EmailTemplateService } from '../../services/email-template.service';
import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { EmailTemplate, EmailTemplatePayload } from '../../../../shared/models/email-template.model';

type AdminTab = 'library' | 'editor';
type MessageState = { type: 'success' | 'error'; text: string } | null;

interface EmailTemplateEditorModel {
  id: number | null;
  code: string;
  name: string;
  subjectTemplate: string;
  htmlTemplate: string;
  active: boolean;
  systemTemplate: boolean;
}

@Component({
  selector: 'app-admin-email-templates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DashboardShellComponent],
  templateUrl: './admin-email-templates.component.html'
})
export class AdminEmailTemplatesComponent implements OnInit {
  activeTab: AdminTab = 'library';
  isLoading = false;
  isSaving = false;
  message: MessageState = null;
  templates: EmailTemplate[] = [];
  selectedTemplate: EmailTemplate | null = null;
  editorMode: 'create' | 'edit' = 'create';

  readonly navItems: DashboardNavItem[] = [
    { id: 'library', label: 'Biblioteca', accent: 'accent-3', mobileBarWidthClass: 'w-24' },
    { id: 'editor', label: 'Editor', accent: 'accent-1', mobileBarWidthClass: 'w-20' }
  ];

  editor: EmailTemplateEditorModel = this.createEmptyEditor();

  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  ngOnInit(): void {
    this.refreshTemplates();
  }

  get activeTemplatesCount(): number {
    return this.templates.filter(template => template.active).length;
  }

  get systemTemplatesCount(): number {
    return this.templates.filter(template => template.systemTemplate).length;
  }

  get selectedVariables(): string[] {
    return this.selectedTemplate?.availableVariables ?? [];
  }

  setActiveTab(tabId: string): void {
    if (tabId === 'library' || tabId === 'editor') {
      this.activeTab = tabId;
    }
  }

  refreshTemplates(): void {
    this.isLoading = true;
    this.emailTemplateService.getEmailTemplates().subscribe({
      next: templates => {
        this.templates = templates;
        if (this.selectedTemplate) {
          this.selectedTemplate = templates.find(template => template.id === this.selectedTemplate?.id) ?? null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message = { type: 'error', text: 'No pudimos cargar las plantillas de correo.' };
      }
    });
  }

  selectTemplate(template: EmailTemplate): void {
    this.selectedTemplate = template;
    this.message = null;
  }

  openCreateEditor(): void {
    this.editorMode = 'create';
    this.editor = this.createEmptyEditor();
    this.selectedTemplate = null;
    this.message = null;
    this.activeTab = 'editor';
  }

  editTemplate(template: EmailTemplate): void {
    this.selectedTemplate = template;
    this.editorMode = 'edit';
    this.editor = {
      id: template.id,
      code: template.code,
      name: template.name,
      subjectTemplate: template.subjectTemplate,
      htmlTemplate: template.htmlTemplate,
      active: template.active,
      systemTemplate: template.systemTemplate
    };
    this.message = null;
    this.activeTab = 'editor';
  }

  saveTemplate(): void {
    if (!this.editor.code.trim() || !this.editor.name.trim() || !this.editor.subjectTemplate.trim() || !this.editor.htmlTemplate.trim()) {
      this.message = { type: 'error', text: 'Codigo, nombre, asunto y HTML son obligatorios.' };
      return;
    }

    this.isSaving = true;
    this.message = null;
    const isEditing = this.editorMode === 'edit' && !!this.editor.id;

    const payload: EmailTemplatePayload = {
      code: this.editor.code.trim(),
      name: this.editor.name.trim(),
      subjectTemplate: this.editor.subjectTemplate.trim(),
      htmlTemplate: this.editor.htmlTemplate.trim(),
      active: this.editor.systemTemplate ? true : this.editor.active
    };

    const request$ = isEditing
      ? this.emailTemplateService.updateEmailTemplate(this.editor.id!, payload)
      : this.emailTemplateService.createEmailTemplate(payload);

    request$.subscribe({
      next: template => {
        this.templates = this.upsertTemplate(template);
        this.selectedTemplate = template;
        this.editorMode = 'edit';
        this.editor = {
          id: template.id,
          code: template.code,
          name: template.name,
          subjectTemplate: template.subjectTemplate,
          htmlTemplate: template.htmlTemplate,
          active: template.active,
          systemTemplate: template.systemTemplate
        };
        this.isSaving = false;
        this.message = {
          type: 'success',
          text: isEditing ? 'Plantilla actualizada correctamente.' : 'Plantilla creada correctamente.'
        };
      },
      error: (error) => {
        this.isSaving = false;
        this.message = { type: 'error', text: error?.error?.message || 'No pudimos guardar la plantilla.' };
      }
    });
  }

  deleteSelectedTemplate(): void {
    if (!this.selectedTemplate || this.selectedTemplate.systemTemplate || typeof window === 'undefined') {
      return;
    }

    const confirmed = window.confirm(`Eliminar la plantilla ${this.selectedTemplate.code}?`);
    if (!confirmed) {
      return;
    }

    this.isSaving = true;
    this.emailTemplateService.deleteEmailTemplate(this.selectedTemplate.id).subscribe({
      next: () => {
        this.templates = this.templates.filter(template => template.id !== this.selectedTemplate?.id);
        this.selectedTemplate = null;
        this.editorMode = 'create';
        this.editor = this.createEmptyEditor();
        this.isSaving = false;
        this.message = { type: 'success', text: 'Plantilla eliminada correctamente.' };
        this.activeTab = 'library';
      },
      error: (error) => {
        this.isSaving = false;
        this.message = { type: 'error', text: error?.error?.message || 'No pudimos eliminar la plantilla.' };
      }
    });
  }

  insertVariable(variable: string): void {
    if (!variable) {
      return;
    }
    this.editor.htmlTemplate = `${this.editor.htmlTemplate}${this.editor.htmlTemplate ? '\n' : ''}${variable}`;
  }

  private upsertTemplate(template: EmailTemplate): EmailTemplate[] {
    const exists = this.templates.some(item => item.id === template.id);
    if (!exists) {
      return [template, ...this.templates];
    }
    return this.templates.map(item => item.id === template.id ? template : item);
  }

  private createEmptyEditor(): EmailTemplateEditorModel {
    return {
      id: null,
      code: '',
      name: '',
      subjectTemplate: '',
      htmlTemplate: '',
      active: true,
      systemTemplate: false
    };
  }
}
