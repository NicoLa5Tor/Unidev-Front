import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import {
  ProjectPricingLevel,
  ProjectPricingLevelPayload,
  ProjectPricingRate,
  ProjectPricingRatePayload
} from '../../../../shared/models/project-pricing-rate.model';
import { ProjectPricingRateService } from '../../services/project-pricing-rate.service';

type AdminTab = 'rates' | 'levels' | 'editor' | 'level-editor';

interface PricingRateEditorModel {
  id: number | null;
  levelId: number | null;
  currency: string;
  hourlyRate: string;
  active: boolean;
  effectiveFrom: string;
}

interface PricingLevelEditorModel {
  id: number | null;
  code: string;
  displayName: string;
  description: string;
  active: boolean;
  productivityPercentage: string;
}

@Component({
  selector: 'app-admin-project-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './admin-project-pricing.component.html'
})
export class AdminProjectPricingComponent implements OnInit {
  activeTab: AdminTab = 'rates';
  isLoadingRates = false;
  isLoadingLevels = false;
  isSaving = false;
  isSavingLevel = false;
  rates: ProjectPricingRate[] = [];
  levels: ProjectPricingLevel[] = [];
  selectedRate: ProjectPricingRate | null = null;
  selectedLevel: ProjectPricingLevel | null = null;
  editorMode: 'create' | 'edit' = 'create';
  levelEditorMode: 'edit' = 'edit';

  readonly navItems: DashboardNavItem[] = [
    { id: 'admin-users', label: 'Usuarios', accent: 'accent-1', route: '/admin/users' },
    { id: 'admin-companies', label: 'Empresas', accent: 'accent-3', route: '/admin/companies' },
    {
      id: 'project-pricing',
      label: 'Pricing de proyectos',
      accent: 'accent-2',
      children: [
        { id: 'rates', label: 'Tarifas', accent: 'accent-3', mobileBarWidthClass: 'w-24' },
        { id: 'levels', label: 'Niveles', accent: 'accent-4', mobileBarWidthClass: 'w-24' },
        { id: 'editor', label: 'Tarifa', accent: 'accent-1', mobileBarWidthClass: 'w-20' },
        { id: 'level-editor', label: 'Nivel', accent: 'accent-2', mobileBarWidthClass: 'w-20' }
      ]
    },
    { id: 'admin-emails', label: 'Correos', accent: 'accent-4', route: '/admin/email-templates' }
  ];

  editor: PricingRateEditorModel = this.createEmptyEditor();
  levelEditor: PricingLevelEditorModel = this.createEmptyLevelEditor();

  constructor(
    private readonly pricingRateService: ProjectPricingRateService,
    private readonly uiToastService: UiToastService
  ) {}

  ngOnInit(): void {
    this.refreshLevels();
    this.refreshRates();
  }

  get activeRatesCount(): number {
    return this.rates.filter(rate => rate.active).length;
  }

  get activeLevelsCount(): number {
    return this.levels.filter(level => level.active).length;
  }

  get currenciesCount(): number {
    return new Set(this.rates.map(rate => rate.currency)).size;
  }

  get availableLevelsForRate(): ProjectPricingLevel[] {
    return this.levels.filter(level => level.active);
  }

  get editorEffectiveFromLabel(): string {
    if (!this.editor.effectiveFrom) {
      return 'Se asigna automaticamente al guardar.';
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(this.editor.effectiveFrom));
  }

  setActiveTab(tabId: string): void {
    if (tabId === 'rates' || tabId === 'levels' || tabId === 'editor' || tabId === 'level-editor') {
      this.activeTab = tabId;
    }
  }

  refreshRates(): void {
    this.isLoadingRates = true;
    this.pricingRateService.getPricingRates(false).subscribe({
      next: rates => {
        this.rates = rates;
        if (this.selectedRate) {
          this.selectedRate = rates.find(rate => rate.id === this.selectedRate?.id) ?? null;
        }
        this.isLoadingRates = false;
      },
      error: error => {
        this.isLoadingRates = false;
        this.uiToastService.error(error?.error?.message || 'No pudimos cargar las tarifas de proyecto.');
      }
    });
  }

  refreshLevels(): void {
    this.isLoadingLevels = true;
    this.pricingRateService.getPricingLevels(false).subscribe({
      next: levels => {
        this.levels = levels;
        this.selectedLevel = this.selectedLevel
          ? levels.find(level => level.id === this.selectedLevel?.id) ?? null
          : (levels[0] ?? null);
        if (this.selectedLevel) {
          this.patchLevelEditor(this.selectedLevel);
        }
        this.isLoadingLevels = false;
      },
      error: error => {
        this.isLoadingLevels = false;
        this.uiToastService.error(error?.error?.message || 'No pudimos cargar los niveles de pricing.');
      }
    });
  }

  selectRate(rate: ProjectPricingRate): void {
    this.selectedRate = rate;
  }

  selectLevel(level: ProjectPricingLevel): void {
    this.selectedLevel = level;
    this.patchLevelEditor(level);
  }

  selectLevelFromEditor(levelId: number | null): void {
    if (levelId == null) {
      return;
    }

    const level = this.levels.find(item => item.id === levelId);
    if (!level) {
      return;
    }

    this.selectLevel(level);
  }

  openCreateEditor(): void {
    this.editorMode = 'create';
    this.editor = this.createEmptyEditor();
    this.selectedRate = null;
    this.activeTab = 'editor';
  }

  editRate(rate: ProjectPricingRate): void {
    this.selectedRate = rate;
    this.editorMode = 'edit';
    this.editor = {
      id: rate.id,
      levelId: rate.levelId,
      currency: rate.currency,
      hourlyRate: String(rate.hourlyRate ?? ''),
      active: rate.active,
      effectiveFrom: this.toDatetimeLocal(rate.effectiveFrom)
    };
    this.activeTab = 'editor';
  }

  editLevel(level: ProjectPricingLevel): void {
    this.selectedLevel = level;
    this.patchLevelEditor(level);
    this.activeTab = 'level-editor';
  }

  saveRate(): void {
    if (!this.editor.levelId || !this.editor.currency.trim()) {
      this.uiToastService.error('Nivel y moneda son obligatorios.');
      return;
    }

    const hourlyRate = Number(this.editor.hourlyRate);
    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      this.uiToastService.error('La tarifa por hora debe ser mayor a 0.');
      return;
    }

    this.isSaving = true;
    const isEditing = this.editorMode === 'edit' && !!this.editor.id;
    const payload: ProjectPricingRatePayload = {
      levelId: this.editor.levelId,
      currency: this.editor.currency.trim().toUpperCase(),
      hourlyRate,
      active: this.editor.active,
      effectiveFrom: null
    };

    const request$ = isEditing
      ? this.pricingRateService.updatePricingRate(this.editor.id!, payload)
      : this.pricingRateService.createPricingRate(payload);

    request$.subscribe({
      next: rate => {
        this.selectedRate = rate;
        this.editorMode = 'edit';
        this.editor = {
          id: rate.id,
          levelId: rate.levelId,
          currency: rate.currency,
          hourlyRate: String(rate.hourlyRate ?? ''),
          active: rate.active,
          effectiveFrom: this.toDatetimeLocal(rate.effectiveFrom)
        };
        this.isSaving = false;
        this.uiToastService.success(isEditing ? 'Tarifa actualizada correctamente.' : 'Tarifa creada correctamente.');
        this.activeTab = 'rates';
        this.refreshRates();
      },
      error: error => {
        this.isSaving = false;
        this.uiToastService.error(error?.error?.message || 'No pudimos guardar la tarifa.');
      }
    });
  }

  saveLevel(): void {
    if (!this.levelEditor.code.trim() || !this.levelEditor.displayName.trim()) {
      this.uiToastService.error('Codigo y nombre del nivel son obligatorios.');
      return;
    }

    const productivityPercentage = Number(this.levelEditor.productivityPercentage);
    if (!Number.isFinite(productivityPercentage) || productivityPercentage <= 0) {
      this.uiToastService.error('La productividad debe ser mayor a 0.');
      return;
    }
    if (!this.levelEditor.id) {
      this.uiToastService.error('Selecciona un nivel existente antes de editarlo.');
      return;
    }

    this.isSavingLevel = true;
    const payload: ProjectPricingLevelPayload = {
      code: this.levelEditor.code.trim().toUpperCase(),
      displayName: this.levelEditor.displayName.trim(),
      description: this.levelEditor.description.trim() ? this.levelEditor.description.trim() : null,
      active: this.levelEditor.active,
      productivityPercentage
    };

    this.pricingRateService.updatePricingLevel(this.levelEditor.id, payload).subscribe({
      next: level => {
        this.selectedLevel = level;
        this.patchLevelEditor(level);
        this.isSavingLevel = false;
        this.uiToastService.success('Nivel actualizado correctamente.');
        this.activeTab = 'levels';
        this.refreshLevels();
      },
      error: error => {
        this.isSavingLevel = false;
        this.uiToastService.error(error?.error?.message || 'No pudimos guardar el nivel.');
      }
    });
  }

  formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
    if (amount == null || !Number.isFinite(amount)) {
      return 'Sin valor';
    }

    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  private createEmptyEditor(): PricingRateEditorModel {
    return {
      id: null,
      levelId: this.availableLevelsForRate[0]?.id ?? null,
      currency: 'COP',
      hourlyRate: '',
      active: true,
      effectiveFrom: ''
    };
  }

  private createEmptyLevelEditor(): PricingLevelEditorModel {
    return {
      id: null,
      code: '',
      displayName: '',
      description: '',
      active: true,
      productivityPercentage: '100'
    };
  }

  private patchLevelEditor(level: ProjectPricingLevel): void {
    this.levelEditor = {
      id: level.id,
      code: level.code,
      displayName: level.displayName,
      description: level.description ?? '',
      active: level.active,
      productivityPercentage: String(level.productivityPercentage ?? '')
    };
  }

  private toDatetimeLocal(value: string): string {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60_000);
    return local.toISOString().slice(0, 16);
  }
}
