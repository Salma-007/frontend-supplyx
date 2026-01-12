import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

interface DashboardStats {
  totalSuppliers: number;
  totalRawMaterials: number;
  criticalStockCount: number;
  ordersEnAttente: number;
  ordersEnCours: number;
  ordersRecues: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  message = '';
  loading = true;
  stats: DashboardStats = {
    totalSuppliers: 0,
    totalRawMaterials: 0,
    criticalStockCount: 0,
    ordersEnAttente: 0,
    ordersEnCours: 0,
    ordersRecues: 0
  };

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    // Appels parallèles pour récupérer toutes les données
    forkJoin({
      suppliers: this.http.get<any[]>(`${this.apiUrl}/suppliers`),
      rawMaterials: this.http.get<any[]>(`${this.apiUrl}/raw-materials`),
      orders: this.http.get<any[]>(`${this.apiUrl}/supply-orders`)
    }).subscribe({
      next: (response) => {
        // Calcul des statistiques
        this.stats.totalSuppliers = response.suppliers.length;
        this.stats.totalRawMaterials = response.rawMaterials.length;

        // Matières en stock critique (quantité < seuil critique)
        this.stats.criticalStockCount = response.rawMaterials.filter(
          (material: any) => material.quantity < material.criticalThreshold
        ).length;

        // Comptage des commandes par statut
        this.stats.ordersEnAttente = response.orders.filter(
          (order: any) => order.status === 'EN_ATTENTE'
        ).length;

        this.stats.ordersEnCours = response.orders.filter(
          (order: any) => order.status === 'EN_COURS'
        ).length;

        this.stats.ordersRecues = response.orders.filter(
          (order: any) => order.status === 'RECUE'
        ).length;

        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques', error);
        this.message = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
