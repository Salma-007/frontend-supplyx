import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductionOrderService } from '../../../services/production-order.service';
import { ProductionOrderResponse, ProductionOrderStatus } from '../../../models/production-order.module';

@Component({
  selector: 'app-production-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './production-order-list.component.html',
  styleUrl: './production-order-list.component.css'
})
export class ProductionOrderListComponent implements OnInit {
  orders: ProductionOrderResponse[] = [];

  constructor(private orderService: ProductionOrderService) {}

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.orderService.getAll(0, 10).subscribe(data => this.orders = data.content);
  }

  getStatusClass(status: ProductionOrderStatus) {
    switch (status) {
      case 'EN_ATTENTE': return 'status-attente';
      case 'EN_PRODUCTION': return 'status-production';
      case 'TERMINE': return 'status-termine';
      case 'BLOQUE': return 'status-bloque';
      default: return 'bg-secondary';
    }
  }

  changeStatus(id: number, status: string) {
    this.orderService.updateStatus(id, status).subscribe({
      next: () => this.loadOrders(),
      error: (err) => alert(err.error.message || "Erreur lors du changement de statut")
    });
  }

  onBlock(id: number) {
    this.orderService.blockOrder(id).subscribe(() => this.loadOrders());
  }

  onDelete(id: number) {
    if(confirm("Supprimer cet ordre ?")) {
      this.orderService.delete(id).subscribe(() => this.loadOrders());
    }
  }
}
