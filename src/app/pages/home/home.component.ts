import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  message = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.http.get<any>('http://localhost:8080/api/test')
      .subscribe({
        next: res => this.message = res.message,
        error: () => this.message = 'Erreur 401/403'
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
