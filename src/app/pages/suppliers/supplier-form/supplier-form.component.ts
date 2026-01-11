import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrls: ['./supplier-form.component.css']
})
export class SupplierFormComponent implements OnInit {
  supplierForm!: FormGroup;
  isEditMode = false;
  supplierId?: number;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private supplierService: SupplierService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.supplierId = +params['id'];
        this.loadSupplier();
      }
    });
  }

  initForm(): void {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      contact: ['', [Validators.required, Validators.email]],
      rating: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      leadTime: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadSupplier(): void {
    if (this.supplierId) {
      this.supplierService.getSupplierById(this.supplierId).subscribe({
        next: (data) => {
          this.supplierForm.patchValue(data);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du chargement du fournisseur';
          console.error(error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire';
      return;
    }

    const supplierData = this.supplierForm.value;

    if (this.isEditMode && this.supplierId) {
      // Mise à jour
      this.supplierService.updateSupplier(this.supplierId, supplierData).subscribe({
        next: () => {
          this.successMessage = 'Fournisseur modifié avec succès';
          setTimeout(() => this.router.navigate(['/suppliers']), 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la modification';
          console.error(error);
        }
      });
    } else {
      // Création
      this.supplierService.createSupplier(supplierData).subscribe({
        next: () => {
          this.successMessage = 'Fournisseur créé avec succès';
          setTimeout(() => this.router.navigate(['/suppliers']), 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          console.error(error);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/suppliers']);
  }

  // Getters pour accéder facilement aux contrôles du formulaire
  get name() { return this.supplierForm.get('name'); }
  get contact() { return this.supplierForm.get('contact'); }
  get rating() { return this.supplierForm.get('rating'); }
  get leadTime() { return this.supplierForm.get('leadTime'); }
}
