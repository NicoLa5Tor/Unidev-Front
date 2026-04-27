import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AdminCatalogService } from '../../services/admin-catalog.service';
import { DashboardNavItem, DashboardShellComponent } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { CompanyOption } from '../../../../shared/models/company.model';
import { RoleOption } from '../../../../shared/models/role.model';
import { CreateUserDto, UpdateUserDto, User } from '../../../../shared/models/user.model';
import { UserService } from '../../../users/services/user.service';

type AdminTab = 'overview' | 'directory' | 'editor';
type MessageState = { type: 'success' | 'error'; text: string } | null;

interface UserEditorModel {
  id: number | null;
  nombre: string;
  displayName: string;
  email: string;
  walletPhone: string;
  roleId: number | null;
  companyId: number | null;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  activeTab: AdminTab = 'overview';
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  message: MessageState = null;
  users: User[] = [];
  roles: RoleOption[] = [];
  companies: CompanyOption[] = [];
  selectedUser: User | null = null;
  editorMode: 'create' | 'edit' = 'create';

  readonly navItems: DashboardNavItem[] = [
    { id: 'admin-companies', label: 'Empresas', accent: 'accent-3', route: '/admin/companies' },
    {
      id: 'user-management',
      label: 'Gestion de usuarios',
      accent: 'accent-1',
      children: [
        { id: 'overview', label: 'Resumen', accent: 'accent-3', mobileBarWidthClass: 'w-20' },
        { id: 'directory', label: 'Directorio', accent: 'accent-1', mobileBarWidthClass: 'w-24' },
        { id: 'editor', label: 'Editor', accent: 'accent-2', mobileBarWidthClass: 'w-20' }
      ]
    },
    { id: 'admin-pricing', label: 'Pricing', accent: 'accent-2', route: '/admin/project-pricing' },
    { id: 'admin-emails', label: 'Correos', accent: 'accent-4', route: '/admin/email-templates' }
  ];

  editor: UserEditorModel = this.createEmptyEditor();

  constructor(
    private readonly userService: UserService,
    private readonly adminCatalogService: AdminCatalogService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.users;
    }
    return this.users.filter(user =>
      [user.displayName, user.nombre, user.email, user.roleName]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(term))
    );
  }

  get adminUsersCount(): number {
    return this.users.filter(user => user.roleName === 'ADMINISTRADORES').length;
  }

  get companyUsersCount(): number {
    return this.users.filter(user => user.roleName === 'EMPRESAS').length;
  }

  get finalUsersCount(): number {
    return this.users.filter(user => user.roleName === 'USUARIOS').length;
  }

  get usersWithoutCompanyCount(): number {
    return this.users.filter(user => !user.companyId).length;
  }

  get selectedRole(): RoleOption | undefined {
    return this.roles.find(role => role.id === this.editor.roleId);
  }

  get requiresCompany(): boolean {
    return this.selectedRole?.roleName === 'USUARIOS';
  }

  setActiveTab(tabId: string): void {
    if (tabId === 'overview' || tabId === 'directory' || tabId === 'editor') {
      this.activeTab = tabId;
    }
  }

  openCreateEditor(): void {
    this.editorMode = 'create';
    this.selectedUser = null;
    this.editor = this.createEmptyEditor();
    this.ensureDefaultRoleSelection();
    this.message = null;
    this.activeTab = 'editor';
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.message = null;
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.editorMode = 'edit';
    this.editor = {
      id: user.id,
      nombre: user.nombre ?? '',
      displayName: user.displayName ?? '',
      email: user.email,
      walletPhone: user.walletPhone ?? '',
      roleId: user.roleId ?? null,
      companyId: user.companyId ?? null
    };
    this.syncCompanyRequirement();
    this.activeTab = 'editor';
  }

  saveUser(): void {
    if (!this.editor.email.trim() || !this.editor.roleId) {
      this.message = { type: 'error', text: 'Email y rol son obligatorios.' };
      return;
    }

    if (this.requiresCompany && !this.editor.companyId) {
      this.message = { type: 'error', text: 'Este rol requiere una empresa asociada.' };
      return;
    }

    this.isSaving = true;
    this.message = null;
    const isEditing = this.editorMode === 'edit' && !!this.editor.id;

    const payload: CreateUserDto | UpdateUserDto = {
      nombre: this.editor.nombre || null,
      displayName: this.editor.displayName || null,
      email: this.editor.email.trim(),
      walletPhone: this.editor.walletPhone.trim() || null,
      roleId: this.editor.roleId,
      companyId: this.requiresCompany ? this.editor.companyId : null
    };

    const request$ = isEditing
      ? this.userService.updateUser(this.editor.id!, payload)
      : this.userService.createUser(payload);

    request$.subscribe({
      next: user => {
        this.upsertUser(user);
        this.editUser(user);
        this.isSaving = false;
        this.message = {
          type: 'success',
          text: isEditing ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.'
        };
      },
      error: () => {
        this.isSaving = false;
        this.message = { type: 'error', text: 'No pudimos guardar el usuario. Revisa los datos e intenta nuevamente.' };
      }
    });
  }

  deleteSelectedUser(): void {
    if (!this.selectedUser || typeof window === 'undefined') {
      return;
    }

    const confirmed = window.confirm(`Eliminar a ${this.selectedUser.email}? Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    this.isSaving = true;
    this.userService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== this.selectedUser?.id);
        this.selectedUser = null;
        this.editorMode = 'create';
        this.editor = this.createEmptyEditor();
        this.ensureDefaultRoleSelection();
        this.isSaving = false;
        this.message = { type: 'success', text: 'Usuario eliminado correctamente.' };
        this.activeTab = 'directory';
      },
      error: () => {
        this.isSaving = false;
        this.message = { type: 'error', text: 'No pudimos eliminar el usuario seleccionado.' };
      }
    });
  }

  refreshUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: users => {
        this.users = users;
        if (this.selectedUser) {
          this.selectedUser = this.users.find(user => user.id === this.selectedUser?.id) ?? null;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message = { type: 'error', text: 'No pudimos actualizar el listado de usuarios.' };
      }
    });
  }

  onRoleChange(): void {
    this.syncCompanyRequirement();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    forkJoin({
      users: this.userService.getUsers(),
      roles: this.adminCatalogService.getRoles(),
      companies: this.adminCatalogService.getCompanies()
    }).subscribe({
      next: ({ users, roles, companies }) => {
        this.users = users;
        this.roles = roles;
        this.companies = companies;
        this.ensureDefaultRoleSelection();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.message = { type: 'error', text: 'No pudimos cargar la consola administrativa.' };
      }
    });
  }

  private ensureDefaultRoleSelection(): void {
    if (this.editor.roleId) {
      return;
    }
    const adminRole = this.roles.find(role => role.roleName === 'ADMINISTRADORES');
    this.editor.roleId = adminRole?.id ?? this.roles[0]?.id ?? null;
    this.syncCompanyRequirement();
  }

  private syncCompanyRequirement(): void {
    if (!this.requiresCompany) {
      this.editor.companyId = null;
    }
  }

  private upsertUser(user: User): void {
    const existingIndex = this.users.findIndex(item => item.id === user.id);
    if (existingIndex >= 0) {
      this.users = this.users.map(item => item.id === user.id ? user : item);
      return;
    }
    this.users = [user, ...this.users];
  }

  private createEmptyEditor(): UserEditorModel {
    return {
      id: null,
      nombre: '',
      displayName: '',
      email: '',
      walletPhone: '',
      roleId: null,
      companyId: null
    };
  }
}
