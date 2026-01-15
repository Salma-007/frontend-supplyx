import {Component, OnInit} from '@angular/core';
import {OrderResponse} from '../../../models/order.module';
import {SalesOrderService} from '../../../services/order.service';
import {CommonModule, NgClass, NgFor, NgIf} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sales-order-list',
  standalone: true,
  imports: [
    NgClass,
    NgFor,
    NgIf,
    CommonModule
  ],
  templateUrl: './sales-order-list.component.html',
  styleUrl: './sales-order-list.component.css'
})
export class SalesOrderListComponent implements OnInit {
  orders: OrderResponse[] = [];
  errorMessage = '';

  constructor(private orderService: SalesOrderService, private router: Router) {}

  ngOnInit() { this.loadOrders(); }

  onAddOrder() {
    this.router.navigate(['/sales-orders/new']);
  }

  loadOrders() {
    this.orderService.getAll().subscribe(data => this.orders = data);
  }

  onChangeStatus(id: number, status: any) {
    this.orderService.updateStatus(id, status.target.value).subscribe({
      next: () => this.loadOrders(),
      error: (err) => this.errorMessage = err.error?.message || 'Erreur de stock/statut'
    });
  }

  onCancel(id: number) {
    if(confirm('Annuler cette commande ?')) {
      this.orderService.cancelOrder(id).subscribe({
        next: () => this.loadOrders(),
        error: (err) => this.errorMessage = err.error?.message
      });
    }
  }
}
