import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserService } from '../../services/user.service';
import { UserResponse, UserMapper } from '../../models/user.module';
import { RoleBadgeComponent } from '../../shared/components/role-badge/role-badge.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RoleBadgeComponent
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit, OnDestroy {
  user?: UserResponse;
  loading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadUser(+id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUser(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUserById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  editUser(): void {
    this.router.navigate(['/users/edit', this.user?.id]);
  }

  deleteUser(): void {
    if (!this.user) return;

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer ${this.getFullName()} ?`);

    if (confirmed) {
      this.userService.deleteUser(this.user.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/users']);
          },
          error: (error) => {
            this.errorMessage = error.message;
          }
        });
    }
  }

  getFullName(): string {
    return this.user ? UserMapper.getFullName(this.user) : '';
  }

  getInitials(): string {
    return this.user ? UserMapper.getInitials(this.user) : '';
  }
}

