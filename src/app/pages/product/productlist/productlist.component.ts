import {Component, OnInit} from '@angular/core';
import {ProductResponse} from '../../../models/product.module';
import {ProductService} from '../../../services/product.service';
import {RouterLink, RouterModule} from '@angular/router';
import {CommonModule, NgClass} from '@angular/common';

@Component({
  selector: 'app-productlist',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    CommonModule,
    RouterModule
  ],
  templateUrl: './productlist.component.html',
  styleUrl: './productlist.component.css'
})
export class ProductListComponent implements OnInit {
  products: ProductResponse[] = [];
  currentPage = 0;
  pageSize = 10;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (data) => this.products = data.content,
      error: (err) => console.error("Erreur de chargement", err)
    });
  }

  onDelete(id: number) {
    if(confirm("Supprimer ce produit ?")) {
      this.productService.delete(id).subscribe(() => this.loadProducts());
    }
  }
}
