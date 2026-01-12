
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { UserRequest, UserResponse, UserSearchFilters } from '../models/user.module';
import { Role } from '../role/role';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly apiUrl = 'http://localhost:8080/api/users';

  private usersCache$ = new BehaviorSubject<UserResponse[]>([]);
  public users$ = this.usersCache$.asObservable();

  constructor(private http: HttpClient) {}

  createUser(user: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(this.apiUrl, user).pipe(
      tap(newUser => {
        this.usersCache$.next([...this.usersCache$.value, newUser]);
      }),
      catchError(this.handleError)
    );
  }

  getAllUsers(forceRefresh: boolean = false): Observable<UserResponse[]> {
    if (this.usersCache$.value.length > 0 && !forceRefresh) {
      return this.users$;
    }

    return this.http.get<UserResponse[]>(this.apiUrl).pipe(
      tap(users => this.usersCache$.next(users)),
      catchError(this.handleError)
    );
  }

  getUserById(id: number): Observable<UserResponse> {
    const cachedUser = this.usersCache$.value.find(u => u.id === id);
    if (cachedUser) {
      return new Observable(observer => {
        observer.next(cachedUser);
        observer.complete();
      });
    }

    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }


  updateUser(id: number, user: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.apiUrl}/${id}`, user).pipe(
      tap(updatedUser => {
        const users = this.usersCache$.value;
        const index = users.findIndex(u => u.id === id);

        if (index !== -1) {
          users[index] = updatedUser;
          this.usersCache$.next([...users]);
        }
      }),
      catchError(this.handleError)
    );
  }


  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.usersCache$.next(
          this.usersCache$.value.filter(u => u.id !== id)
        );
      }),
      catchError(this.handleError)
    );
  }

  filterUsers(filters: UserSearchFilters): Observable<UserResponse[]> {
    return this.users$.pipe(
      map(users => this.applyFilters(users, filters))
    );
  }

  private applyFilters(users: UserResponse[], filters: UserSearchFilters): UserResponse[] {
    let filtered = [...users];

    // Search
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    // Role
    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Sort
    if (filters.sortBy) {
      filtered = this.sortUsers(
        filtered,
        filters.sortBy,
        filters.sortOrder || 'asc'
      );
    }

    return filtered;
  }

  private sortUsers(
    users: UserResponse[],
    sortBy: 'firstName' | 'lastName' | 'email' | 'role',
    sortOrder: 'asc' | 'desc'
  ): UserResponse[] {
    return users.sort((a, b) => {
      const valueA = a[sortBy];
      const valueB = b[sortBy];

      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  getUsersByRole(role: Role): Observable<UserResponse[]> {
    return this.users$.pipe(
      map(users => users.filter(user => user.role === role))
    );
  }

  countUsersByRole(): Observable<Record<Role, number>> {
    return this.users$.pipe(
      map(users => {
        const counts = {} as Record<Role, number>;

        Object.values(Role).forEach(role => counts[role] = 0);
        users.forEach(user => counts[user.role]++);

        return counts;
      })
    );
  }

  emailExists(email: string, excludeUserId?: number): Observable<boolean> {
    return this.users$.pipe(
      map(users =>
        users.some(user =>
          user.email.toLowerCase() === email.toLowerCase() &&
          user.id !== excludeUserId
        )
      )
    );
  }


  clearCache(): void {
    this.usersCache$.next([]);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client : ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Données invalides';
          break;
        case 404:
          errorMessage = 'Utilisateur non trouvé';
          break;
        case 409:
          errorMessage = 'Cet email existe déjà';
          break;
        case 500:
          errorMessage = 'Erreur serveur';
          break;
        default:
          errorMessage = error.error?.message || 'Erreur inconnue';
      }
    }

    console.error('UserService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
