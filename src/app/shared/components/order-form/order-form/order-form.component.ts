import {Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SupplyOrderService } from '../../../../services/supply-order.service';
import { SupplierService } from '../../../../services/supplier.service';
import { RawMaterialService } from '../../../../services/raw-material.service';
import { SupplyOrderRequest, SupplyOrderItem } from '../../../../models/supply-order.module';
import { SupplierResponse } from '../../../../models/supplier.module';
import { RawMaterialResponse } from '../../../../models/raw-material.model';

/**
 * Composant de formulaire pour créer une commande d'approvisionnement
 * Avec pivot table pour sélectionner les matières premières et quantités
 */
@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit, OnDestroy {
  orderForm!: FormGroup;
  protected readonly Math = Math;

  // Données pour les selects
  suppliers: SupplierResponse[] = [];
  rawMaterials: RawMaterialResponse[] = [];
  filteredMaterials: RawMaterialResponse[] = [];

  // État
  loading = false;
  loadingData = true;
  errorMessage = '';
  successMessage = '';
  searchMaterialTerm = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private orderService: SupplyOrderService,
    private supplierService: SupplierService,
    private rawMaterialService: RawMaterialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFormData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialise le formulaire
   */
  private initForm(): void {
    this.orderForm = this.fb.group({
      supplierId: [null, Validators.required],
      orderItems: this.fb.array([], Validators.required)
    });
  }

  /**
   * Charge les données nécessaires (fournisseurs + matières premières)
   */
  private loadFormData(): void {
    this.loadingData = true;

    forkJoin({
      suppliers: this.supplierService.getAllSuppliers(),
      materials: this.rawMaterialService.getAll()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ suppliers, materials }) => {
          this.suppliers = suppliers;
          this.rawMaterials = materials;
          this.filteredMaterials = materials;
          this.loadingData = false;
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du chargement des données';
          this.loadingData = false;
        }
      });
  }

  /**
   * Getter pour accéder au FormArray des items
   */
  get orderItems(): FormArray {
    return this.orderForm.get('orderItems') as FormArray;
  }

  /**
   * Ajoute un item de matière première
   */
  addOrderItem(): void {
    const itemGroup = this.fb.group({
      materialId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });

    this.orderItems.push(itemGroup);
  }

  /**
   * Retire un item
   */
  removeOrderItem(index: number): void {
    this.orderItems.removeAt(index);
  }

  /**
   * Recherche de matières premières
   */
  filterMaterials(): void {
    if (!this.searchMaterialTerm) {
      this.filteredMaterials = this.rawMaterials;
      return;
    }

    const search = this.searchMaterialTerm.toLowerCase();
    this.filteredMaterials = this.rawMaterials.filter(material =>
      material.name.toLowerCase().includes(search) ||
      material.unit.toLowerCase().includes(search)
    );
  }

  /**
   * Obtient les informations d'une matière première
   */
  getMaterialInfo(materialId: number): RawMaterialResponse | undefined {
    return this.rawMaterials.find(m => m.id === materialId);
  }

  /**
   * Vérifie si une matière est déjà sélectionnée
   */
  isMaterialSelected(materialId: number): boolean {
    return this.orderItems.controls.some(
      control => control.get('materialId')?.value === materialId
    );
  }

  /**
   * Obtient les matières disponibles (non sélectionnées)
   */
  getAvailableMaterials(): RawMaterialResponse[] {
    return this.filteredMaterials.filter(
      material => !this.isMaterialSelected(material.id)
    );
  }

  /**
   * Calcule la quantité totale de la commande
   */
  getTotalQuantity(): number {
    return this.orderItems.controls.reduce((total, control) => {
      const quantity = control.get('quantity')?.value || 0;
      return total + quantity;
    }, 0);
  }

  /**
   * Calcule le nombre total d'articles
   */
  getTotalItems(): number {
    return this.orderItems.length;
  }

  /**
   * Valide le formulaire
   */
  private validateForm(): boolean {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched(this.orderForm);
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire';
      return false;
    }

    if (this.orderItems.length === 0) {
      this.errorMessage = 'Veuillez ajouter au moins un article';
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const formValue = this.orderForm.value;

    // Conversion explicite pour correspondre à l'interface SupplyOrderRequest
    const orderRequest: SupplyOrderRequest = {
      supplierId: Number(formValue.supplierId), // Forcer en nombre
      orderItems: formValue.orderItems.map((item: any) => ({
        materialId: Number(item.materialId), // Forcer en nombre
        quantity: Number(item.quantity)      // Forcer en nombre
      }))
    };

    this.loading = true;
    this.errorMessage = '';

    this.orderService.createOrder(orderRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdOrder) => {
          this.successMessage = `Commande #${createdOrder.id} créée avec succès !`;
          this.loading = false;
          setTimeout(() => this.router.navigate(['/supply-orders', createdOrder.id]), 1500);
        },
        error: (error) => {
          // Affichez l'erreur réelle retournée par le serveur pour débugger
          this.errorMessage = error.error?.message || error.message || 'Erreur lors de la création';
          this.loading = false;
        }
      });
  }

  /**
   * Marque tous les champs comme touchés
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          }
        });
      }
    });
  }

  /**
   * Annule et retourne à la liste
   */
  cancel(): void {
    const hasChanges = this.orderForm.dirty;

    if (hasChanges) {
      const confirmed = confirm('Des modifications non enregistrées seront perdues. Continuer ?');
      if (!confirmed) return;
    }

    this.router.navigate(['/supply-orders']);
  }

  /**
   * Réinitialise le formulaire
   */
  resetForm(): void {
    this.orderForm.reset();
    this.orderItems.clear();
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Obtient le fournisseur sélectionné
   */
  get selectedSupplier(): SupplierResponse | undefined {
    const supplierId = this.orderForm.get('supplierId')?.value;
    return this.suppliers.find(s => s.id === supplierId);
  }

  /**
   * Vérifie si un champ a une erreur
   */
  hasError(controlName: string, errorName: string): boolean {
    const control = this.orderForm.get(controlName);
    return !!(control?.hasError(errorName) && control?.touched);
  }

  /**
   * Vérifie si un item a une erreur
   */
  hasItemError(index: number, controlName: string, errorName: string): boolean {
    const control = this.orderItems.at(index).get(controlName);
    return !!(control?.hasError(errorName) && control?.touched);
  }
}
