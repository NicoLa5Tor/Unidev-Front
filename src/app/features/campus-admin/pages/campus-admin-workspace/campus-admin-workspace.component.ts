import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserSessionService } from '../../../../core/services/user-session.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';
import { DashboardShellComponent, DashboardNavItem } from '../../../../shared/components/dashboard-shell/dashboard-shell.component';
import { CompanyService } from '../../../companies/services/company.service';
import { StudentService } from '../../../universities/services/student.service';
import { RatingService } from '../../../companies/services/rating.service';
import { StudentTeam } from '../../../../shared/models/student.model';
import { RankingEntry } from '../../../../shared/models/rating.model';
import { CompanyUser, CreateCompanyUserDto } from '../../../../shared/models/company.model';
import { SessionUser } from '../../../../shared/models/session-user.model';

@Component({
  selector: 'app-campus-admin-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardShellComponent],
  templateUrl: './campus-admin-workspace.component.html'
})
export class CampusAdminWorkspaceComponent implements OnInit {
  private readonly userSessionService = inject(UserSessionService);
  private readonly companyService = inject(CompanyService);
  private readonly studentService = inject(StudentService);
  private readonly ratingService = inject(RatingService);
  private readonly toast = inject(UiToastService);

  currentUser: SessionUser | null = null;
  campusTeams: StudentTeam[] = [];
  tutors: CompanyUser[] = [];

  activeTab = 'teams';

  navItems: DashboardNavItem[] = [
    { id: 'teams',   label: 'Equipos de sede',  accent: 'accent-1' },
    { id: 'tutors',  label: 'Tutores',           accent: 'accent-2' },
    { id: 'ranking', label: 'Ranking',           accent: 'accent-3' },
  ];

  isLoadingTeams = false;
  isLoadingTutors = false;

  userRanking: RankingEntry[] = [];
  teamRanking: RankingEntry[] = [];
  isLoadingRanking = false;
  rankingTab: 'users' | 'teams' = 'users';

  showCreateTutorForm = false;
  isCreatingTutor = false;
  newTutorEmail = '';
  newTutorDisplayName = '';

  async ngOnInit(): Promise<void> {
    this.userSessionService.loadCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.loadTeams();
  }

  onTabChange(tab: string): void {
    this.activeTab = tab;
    if (tab === 'teams') this.loadTeams();
    if (tab === 'tutors') this.loadTutors();
    if (tab === 'ranking' && this.userRanking.length === 0 && this.teamRanking.length === 0) this.loadRanking();
  }

  loadRanking(): void {
    this.isLoadingRanking = true;
    this.ratingService.getUserRanking().subscribe({
      next: entries => { this.userRanking = entries; },
      error: () => {}
    });
    this.ratingService.getTeamRanking().subscribe({
      next: entries => { this.teamRanking = entries; this.isLoadingRanking = false; },
      error: () => { this.isLoadingRanking = false; }
    });
  }

  starsArray(score: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  loadTeams(): void {
    this.isLoadingTeams = true;
    this.studentService.listCampusTeams().subscribe({
      next: teams => {
        this.campusTeams = teams;
        this.isLoadingTeams = false;
      },
      error: () => {
        this.isLoadingTeams = false;
        this.toast.error('No se pudieron cargar los equipos de la sede');
      }
    });
  }

  loadTutors(): void {
    this.isLoadingTutors = true;
    this.companyService.listCompanyUsers().subscribe({
      next: users => {
        this.tutors = users;
        this.isLoadingTutors = false;
      },
      error: () => {
        this.isLoadingTutors = false;
        this.toast.error('No se pudieron cargar los tutores');
      }
    });
  }

  createTutor(): void {
    if (!this.newTutorEmail.trim()) return;
    this.isCreatingTutor = true;
    const payload: CreateCompanyUserDto = {
      email: this.newTutorEmail.trim(),
      displayName: this.newTutorDisplayName.trim() || undefined
    };
    this.companyService.createCompanyUser(payload).subscribe({
      next: tutor => {
        this.tutors = [tutor, ...this.tutors];
        this.showCreateTutorForm = false;
        this.newTutorEmail = '';
        this.newTutorDisplayName = '';
        this.isCreatingTutor = false;
        this.toast.success('Tutor registrado correctamente');
      },
      error: (err) => {
        this.isCreatingTutor = false;
        this.toast.error(err?.error?.message || 'No se pudo registrar el tutor');
      }
    });
  }
}
