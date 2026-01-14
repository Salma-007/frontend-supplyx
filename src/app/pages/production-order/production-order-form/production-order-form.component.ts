import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductionOrderService } from '../../../services/production-order.service';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-production-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './production-order-form.component.html',
  styleUrl: './production-order-form.component.css'
})
export class ProductionOrderFormComponent implements OnInit {
  orderForm: FormGroup;
  products: any[] = [];
  isEditMode = false;
  orderId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private orderService: ProductionOrderService,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Charger les produits pour le dropdown
    this.productService.getAll(0, 100).subscribe(res => this.products = res.content);

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.orderId = +id;
      this.orderService.getById(this.orderId).subscribe(order => {
        this.orderForm.patchValue(order);
      });
    }
  }

  onSubmit() {
    if (this.orderForm.invalid) return;
    const obs = this.isEditMode && this.orderId
      ? this.orderService.update(this.orderId, this.orderForm.value)
      : this.orderService.create(this.orderForm.value);

    obs.subscribe({
      next: () => this.router.navigate(['/production-orders']),
      error: (err) => alert(err.error.message || "Erreur lors de l'enregistrement")
    });
  }
}
