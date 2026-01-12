import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UserService } from '../../services/user.service';
import { UserResponse, UserMapper, UserSearchFilters } from '../../models/user.module';
import { Role, RoleUtils } from '../../role/role';
import { RoleBadgeComponent } from '../../shared/components/role-badge/role-badge.component';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RoleBadgeComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  // État du composant
  loading = true;
  errorMessage = '';

  // Données
  users: UserResponse[] = [];
  filteredUsers: UserResponse[] = [];

  // Filtres
  searchTerm = '';
  selectedRole: Role | '' = '';
  sortBy: 'firstName' | 'lastName' | 'email' | 'role' = 'firstName';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Pour la recherche avec debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Données pour le dropdown de rôles
  availableRoles = RoleUtils.getRolesForSelect();

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les utilisateurs
   */
  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getAllUsers(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Configure la recherche avec debounce
   */
  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  /**
   * Déclenche la recherche
   */
  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  /**
   * Filtre par rôle
   */
  onRoleFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Applique tous les filtres
   */
  private applyFilters(): void {
    const filters: UserSearchFilters = {
      searchTerm: this.searchTerm,
      role: this.selectedRole || undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.userService.filterUsers(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(filtered => {
        this.filteredUsers = filtered;
      });
  }

  /**
   * Change le tri
   */
  changeSortBy(field: 'firstName' | 'lastName' | 'email' | 'role'): void {
    if (this.sortBy === field) {
      // Inverser l'ordre si on clique sur la même colonne
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.sortBy = 'firstName';
    this.sortOrder = 'asc';
    this.applyFilters();
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(id: number, userName: string): void {
    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer ${userName} ?`);

    if (confirmed) {
      this.userService.deleteUser(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadUsers();
          },
          error: (error) => {
            this.errorMessage = error.message;
          }
        });
    }
  }

  /**
   * Navigation
   */
  navigateToCreate(): void {
    this.router.navigate(['/users/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/users', id]);
  }

  /**
   * Obtient le nom complet d'un utilisateur
   */
  getFullName(user: UserResponse): string {
    return UserMapper.getFullName(user);
  }

  /**
   * Obtient les initiales d'un utilisateur
   */
  getInitials(user: UserResponse): string {
    return UserMapper.getInitials(user);
  }

  /**
   * Obtient l'icône de tri
   */
  getSortIcon(field: string): string {
    if (this.sortBy !== field) return 'fas fa-sort';
    return this.sortOrder === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }
}
