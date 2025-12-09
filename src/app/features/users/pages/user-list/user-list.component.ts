import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../../../shared/models/user.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AnimationService } from '../../../../core/services/animation.service';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, AfterViewInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private animationService: AnimationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    // Animate the page container on load
    this.animationService.pageEnter(this.elementRef.nativeElement.querySelector('.user-list-container'));
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUsers().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.users = response.data;
          // Animate table rows with stagger effect after data loads
          setTimeout(() => {
            this.animationService.staggerFadeIn('.users-table tbody tr', 100);
          }, 100);
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error loading users';
        this.loading = false;
        // Shake the error message to draw attention
        setTimeout(() => {
          this.animationService.shake('.error', 600);
        }, 100);
        console.error('Error loading users:', error);
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      // Find and animate the row being deleted
      const rowToDelete = this.elementRef.nativeElement.querySelector(`tr[data-user-id="${userId}"]`);
      if (rowToDelete) {
        this.animationService.fadeOut(rowToDelete, 400).complete = () => {
          this.userService.deleteUser(userId).subscribe({
            next: () => {
              this.users = this.users.filter(user => user.id !== userId);
            },
            error: (error) => {
              this.error = 'Error deleting user';
              // Animate the row back in if there was an error
              this.animationService.fadeIn(rowToDelete, 400);
              console.error('Error deleting user:', error);
            }
          });
        };
      }
    }
  }
}
