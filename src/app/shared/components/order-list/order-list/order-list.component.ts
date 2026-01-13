import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SupplyOrderService } from '../../../../services/supply-order.service';
import { SupplierService } from '../../../../services/supplier.service';
import {
  SupplyOrderResponse,
  SupplyOrderListItem,
  SupplyOrderMapper,
  SupplyOrderSearchFilters
} from '../../../../models/supply-order.module';
import { SupplyOrderStatus, SupplyOrderStatusUtils } from '../../../../enums/supply-order-status';
import { StatusBadgeComponent } from '../../status-badge/status-badge/status-badge.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatusBadgeComponent
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit, OnDestroy {
  // État du composant
  loading = true;
  errorMessage = '';

  // Données
  orders: SupplyOrderListItem[] = [];
  filteredOrders: SupplyOrderListItem[] = [];
  suppliersMap = new Map<number, string>();

  // Filtres
  searchTerm = '';
  selectedStatus: SupplyOrderStatus | '' = '';

  // Pour la recherche avec debounce
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Données pour les filtres
  availableStatuses = SupplyOrderStatusUtils.getStatusesForSelect();

  // Expose l'enum pour le template
  SupplyOrderStatus = SupplyOrderStatus;

  constructor(
    private orderService: SupplyOrderService,
    private supplierService: SupplierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les données (commandes + fournisseurs)
   */
  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      orders: this.orderService.getAllOrders(true),
      suppliers: this.supplierService.getAllSuppliers()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ orders, suppliers }) => {
          // Créer le map des fournisseurs
          this.suppliersMap = new Map(
            suppliers.map(s => [s.id, s.name])
          );

          // Convertir les commandes en liste d'affichage
          this.orders = SupplyOrderMapper.toListItems(orders, this.suppliersMap);
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
   * Filtre par statut
   */
  onStatusFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Applique tous les filtres
   */
  private applyFilters(): void {
    let filtered = [...this.orders];

    // Filtre par recherche (ID ou nom de matière)
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(searchLower) ||
        order.orderItems.some(item =>
          item.materialName.toLowerCase().includes(searchLower)
        ) ||
        order.supplierName?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par statut
    if (this.selectedStatus) {
      filtered = filtered.filter(order => order.status === this.selectedStatus);
    }

    this.filteredOrders = filtered;
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  /**
   * Change le statut d'une commande
   */
  changeStatus(orderId: number, newStatus: SupplyOrderStatus): void {
    const confirmed = confirm(`Changer le statut vers "${SupplyOrderStatusUtils.getStatusLabel(newStatus)}" ?`);

    if (confirmed) {
      this.orderService.updateOrderStatus(orderId, newStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadData();
          },
          error: (error) => {
            this.errorMessage = error.message;
          }
        });
    }
  }

  /**
   * Supprime une commande
   */
  deleteOrder(id: number): void {
    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer la commande #${id} ?`);

    if (confirmed) {
      this.orderService.deleteOrder(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadData();
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
    this.router.navigate(['/orders/new']);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/orders', id]);
  }

  /**
   * Formate la date
   */
  formatDate(dateString: string): string {
    return SupplyOrderMapper.formatDate(dateString);
  }

  /**
   * Obtient les statuts possibles pour une commande
   */
  getNextStatuses(order: SupplyOrderListItem): SupplyOrderStatus[] {
    return SupplyOrderStatusUtils.getNextPossibleStatuses(order.status);
  }

  protected readonly SupplyOrderStatusUtils = SupplyOrderStatusUtils;
}
