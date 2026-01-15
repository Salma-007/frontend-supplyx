import {Component, OnInit} from '@angular/core';
import {SalesOrderService} from '../../../services/order.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CustomerService} from '../../../services/customer.service';
import {ProductService} from '../../../services/product.service';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {forkJoin} from 'rxjs';
import {CommonModule} from '@angular/common';
import {CustomerResponse} from '../../../models/customer.module';

@Component({
  selector: 'app-sales-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sales-order-form.component.html',
  styleUrls: ['./sales-order-form.component.css']
})
export class SalesOrderFormComponent implements OnInit {
  orderForm: FormGroup;
  isEditMode = false;
  orderId?: number;

  customers: CustomerResponse[] = [];
  products: any[] = [];

  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private orderService: SalesOrderService,
    private customerService: CustomerService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      customerId: [null, Validators.required],
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.loading = true;

    forkJoin({
      customers: this.customerService.getAll(),
      products: this.productService.getAll(0, 20)
    }).subscribe({
      next: (res: any) => {
        this.customers = res.customers.content || res.customers;

        if (res.products && res.products.content) {
          this.products = res.products.content;
        } else if (Array.isArray(res.products)) {
          this.products = res.products;
        } else {
          this.products = res.products?.items || res.products?.data || [];
        }

        this.checkEditMode();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = "Erreur lors du chargement des données de référence.";
        this.loading = false;
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.orderId = +id;
      this.orderService.getById(this.orderId).subscribe(order => {
        this.orderForm.patchValue({
          customerId: order.customerId,
          productId: order.productId,
          quantity: order.quantity
        });
      });
    }
  }

  onSubmit(): void {
    if (this.orderForm.invalid) return;

    this.loading = true;
    const request = this.orderForm.value;

    const action = this.isEditMode
      ? this.orderService.update(this.orderId!, request)
      : this.orderService.create(request);

    action.subscribe({
      next: () => this.router.navigate(['/sales-orders']),
      error: (err) => {
        this.errorMessage = err.error?.message || "Une erreur est survenue.";
        this.loading = false;
      }
    });
  }
}
