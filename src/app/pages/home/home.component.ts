import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import {DashboardStats} from '../../models/dashboard.module';
import {KpiCard} from '../../models/kpi-card.module';
import {DashboardService} from '../../services/dashboard.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loading = true;
  errorMessage = '';

  stats!: DashboardStats;
  kpiCards: KpiCard[] = [];

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: stats => {
        this.stats = <DashboardStats>stats;
        this.prepareKpis();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Erreur chargement dashboard';
        this.loading = false;
      }
    });
  }

  private prepareKpis(): void {
    this.kpiCards = [
      {
        title: 'Fournisseurs',
        value: this.stats.totalSuppliers,
        icon: 'truck',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        route: '/suppliers',
        color: ""
      },
      {
        title: 'Stocks Critiques',
        value: this.stats.criticalStockCount,
        icon: 'exclamation-triangle',
        gradient: 'linear-gradient(135deg, #f56565 0%, #c53030 100%)',
        route: '/raw-materials',
        showAlert: this.stats.criticalStockCount > 0,
        color: ""
      },
      {
        title: 'Clients Actifs',
        value: this.stats.totalCustomers || 0,
        icon: 'users',
        gradient: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        route: '/customers',
        color: ""
      },
      {
        title: 'Ventes en Cours',
        value: this.stats.totalSalesOrders || 0,
        icon: 'file-invoice-dollar',
        gradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
        route: '/sales-orders',
        color: ""
      }
    ];
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout();
  }
}

