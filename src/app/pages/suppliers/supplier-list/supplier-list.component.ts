import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupplierService } from '../../../services/supplier.service';
import { SupplierResponse } from '../../../models/supplier.module';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: SupplierResponse[] = [];
  loading = false;
  errorMessage = '';
  searchName = '';

  constructor(
    private supplierService: SupplierService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.supplierService.getAllSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des fournisseurs';
        this.loading = false;
        console.error(error);
      }
    });
  }

  deleteSupplier(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.supplierService.deleteSupplier(id).subscribe({
        next: () => {
          this.loadSuppliers(); // Recharger la liste
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
          console.error(error);
        }
      });
    }
  }

  searchSupplier(): void {
    if (!this.searchName.trim()) {
      this.loadSuppliers();
      return;
    }

    this.supplierService.searchSupplierByName(this.searchName).subscribe({
      next: (data) => {
        this.suppliers = [data];
      },
      error: (error) => {
        this.errorMessage = 'Fournisseur non trouvé';
        console.error(error);
      }
    });
  }

  navigateToCreate(): void {
    this.router.navigate(['/suppliers/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/suppliers/edit', id]);
  }

  navigateToDetail(id: number): void {
    this.router.navigate(['/suppliers', id]);
  }
}
