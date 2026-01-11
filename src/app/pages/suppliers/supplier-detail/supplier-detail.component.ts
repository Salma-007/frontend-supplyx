import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupplierService } from '../../../services/supplier.service';
import { SupplierResponse } from '../../../models/supplier.module';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './supplier-detail.component.html',
  styleUrls: ['./supplier-detail.component.css']
})
export class SupplierDetailComponent implements OnInit {
  supplier?: SupplierResponse;
  loading = false;
  errorMessage = '';

  constructor(
    private supplierService: SupplierService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadSupplier(+id);
  }

  loadSupplier(id: number): void {
    this.loading = true;
    this.supplierService.getSupplierById(id).subscribe({
      next: (data) => {
        this.supplier = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Fournisseur introuvable';
        this.loading = false;
        console.error(error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/suppliers']);
  }

  editSupplier(): void {
    this.router.navigate(['/suppliers/edit', this.supplier?.id]);
  }
}
