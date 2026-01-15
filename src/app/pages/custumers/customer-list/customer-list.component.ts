import {Component, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {CustomerResponse} from '../../../models/customer.module';
import {CustomerService} from '../../../services/customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-list.component.html'
})
export class CustomerListComponent implements OnInit {
  customers: CustomerResponse[] = [];
  errorMessage = '';

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void { this.loadCustomers(); }

  loadCustomers(): void {
    this.customerService.getAll().subscribe({
      next: (data) => this.customers = data,
      error: () => this.errorMessage = 'Erreur de chargement'
    });
  }

  onDelete(id: number): void {
    if (confirm('Supprimer ce client ?')) {
      this.customerService.delete(id).subscribe({
        next: () => this.loadCustomers(),
        error: (err) => this.errorMessage = err.error?.message || 'Erreur lors de la suppression'
      });
    }
  }
}
