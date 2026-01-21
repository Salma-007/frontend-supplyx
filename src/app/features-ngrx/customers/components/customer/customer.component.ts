import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CustomerActions } from '../../store/customer.actions';
import { CustomerRequest, Customer } from '../../model/customer.model';
import { selectAllCustomers } from '../../store/customer.selectors';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule // ✅ obligatoire pour *ngIf et *ngFor
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit {

  private store = inject(Store);

  customers$ = this.store.select(selectAllCustomers);

  // ✅ utilisés dans le template
  isEditMode = false;

  currentCustomer: CustomerRequest & { id?: number } = {
    name: '',
    city: '',
    address: ''
  };

  ngOnInit() {
    this.store.dispatch(CustomerActions.loadCustomers());
  }

  // ✅ submit form
  onSubmit() {
    if (this.isEditMode && this.currentCustomer.id) {
      this.store.dispatch(
        CustomerActions.updateCustomer({
          id: this.currentCustomer.id,
          customer: this.currentCustomer as Customer
        })
      );
    } else {
      this.store.dispatch(
        CustomerActions.addCustomer({
          customer: this.currentCustomer
        })
      );
    }

    this.resetForm();
  }

  // ✅ edit customer
  onEdit(customer: Customer) {
    this.isEditMode = true;
    this.currentCustomer = { ...customer };
  }

  // ✅ delete
  onDelete(id: number) {
    if (confirm('Supprimer ce client ?')) {
      this.store.dispatch(CustomerActions.deleteCustomer({ id }));
    }
  }

  // ✅ reset form
  resetForm() {
    this.isEditMode = false;
    this.currentCustomer = {
      name: '',
      city: '',
      address: ''
    };
  }
}
