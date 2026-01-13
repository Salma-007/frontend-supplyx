import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SupplyOrderService } from '../../../../services/supply-order.service';
import { SupplierService } from '../../../../services/supplier.service';
import {
  SupplyOrderResponse,
  SupplyOrderMapper
} from '../../../../models/supply-order.module';
import { SupplyOrderStatus, SupplyOrderStatusUtils } from '../../../../enums/supply-order-status';
import { StatusBadgeComponent } from '../../status-badge/status-badge/status-badge.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgeComponent
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order?: SupplyOrderResponse;
  supplierName = '';
  loading = true;
  errorMessage = '';

  // Expose pour le template
  SupplyOrderStatus = SupplyOrderStatus;
  SupplyOrderStatusUtils = SupplyOrderStatusUtils;

  private destroy$ = new Subject<void>();

  constructor(
    private orderService: SupplyOrderService,
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadOrder(+id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la commande et le fournisseur
   */
  loadOrder(id: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.orderService.getOrderById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.loadSupplier(order.supplierId);
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Charge les informations du fournisseur
   */
  private loadSupplier(supplierId: number): void {
    this.supplierService.getSupplierById(supplierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (supplier) => {
          this.supplierName = supplier.name;
          this.loading = false;
        },
        error: () => {
          this.supplierName = 'Inconnu';
          this.loading = false;
        }
      });
  }

  /**
   * Change le statut de la commande
   */
  changeStatus(newStatus: SupplyOrderStatus): void {
    if (!this.order) return;

    const statusLabel = SupplyOrderStatusUtils.getStatusLabel(newStatus);
    const confirmed = confirm(`Changer le statut vers "${statusLabel}" ?`);

    if (confirmed) {
      this.orderService.updateOrderStatus(this.order.id, newStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedOrder) => {
            this.order = updatedOrder;
          },
          error: (error) => {
            this.errorMessage = error.message;
          }
        });
    }
  }

  /**
   * Supprime la commande
   */
  deleteOrder(): void {
    if (!this.order) return;

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer la commande #${this.order.id} ?`);

    if (confirmed) {
      this.orderService.deleteOrder(this.order.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/supply-orders']);
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
  goBack(): void {
    this.router.navigate(['/supply-orders']);
  }

  /**
   * Formate la date
   */
  formatDate(dateString: string): string {
    return SupplyOrderMapper.formatDate(dateString);
  }

  /**
   * Calcule la quantité totale
   */
  getTotalQuantity(): number {
    if (!this.order) return 0;
    return this.order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Obtient les statuts possibles
   */
  getNextStatuses(): SupplyOrderStatus[] {
    if (!this.order) return [];
    return SupplyOrderStatusUtils.getNextPossibleStatuses(this.order.status);
  }

  /**
   * Vérifie si le statut peut être modifié
   */
  canChangeStatus(): boolean {
    if (!this.order) return false;
    return SupplyOrderStatusUtils.canChangeStatus(this.order.status);
  }
}
