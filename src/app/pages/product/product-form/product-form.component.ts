import {Component, OnInit} from '@angular/core';
import {FormsModule, FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import {ProductService} from '../../../services/product.service';
import {RawMaterialService} from '../../../services/raw-material.service';
import { ActivatedRoute, Router } from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  rawMaterials: any[] = [];
  isEditMode = false;
  productId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private rawMaterialService: RawMaterialService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      productionTime: [0, [Validators.required, Validators.min(0)]],
      cost: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.min(0)]],
      bills: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadRawMaterials();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProductData(this.productId);
    }
  }

  get bills() { return this.productForm.get('bills') as FormArray; }

  loadProductData(id: number) {
    this.productService.getById(id).subscribe({
      next: (product) => {
        // Remplir les champs simples
        this.productForm.patchValue({
          name: product.name,
          productionTime: product.productionTime,
          cost: product.cost,
          stock: product.stock
        });

        product.bills.forEach(bill => {
          this.bills.push(this.fb.group({
            rawMaterialId: [bill.rawMaterialId, Validators.required],
            quantity: [bill.quantity, [Validators.required, Validators.min(1)]]
          }));
        });
      },
      error: (err) => console.error('Erreur lors du chargement du produit', err)
    });
  }

  addBill() {
    const billGroup = this.fb.group({
      rawMaterialId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.bills.push(billGroup);
  }

  removeBill(index: number) { this.bills.removeAt(index); }

  loadRawMaterials() {
    this.rawMaterialService.getAll().subscribe(data => this.rawMaterials = data);
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    const productData = this.productForm.value;

    if (this.isEditMode && this.productId) {
      // Appel au UPDATE du backend
      this.productService.update(this.productId, productData).subscribe({
        next: () => {
          alert('Produit mis à jour !');
          this.router.navigate(['/products']);
        },
        error: (err) => console.error(err)
      });
    } else {

      this.productService.create(productData).subscribe({
        next: () => {
          alert('Produit créé avec succès !');
          this.router.navigate(['/products']);
        },
        error: (err) => console.error(err)
      });
    }
  }
}
