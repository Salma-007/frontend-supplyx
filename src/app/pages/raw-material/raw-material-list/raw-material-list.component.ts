import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RawMaterialService } from '../../../services/raw-material.service';
import { RawMaterialResponse, RawMaterialRequest } from '../../../models/raw-material.model';

@Component({
  selector: 'app-raw-material-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './raw-material-list.component.html',
  styleUrls: ['./raw-material-list.component.css']
})
export class RawMaterialListComponent implements OnInit {
  materials: RawMaterialResponse[] = [];
  showForm = false;
  editingId: number | null = null;

  newMaterial: RawMaterialRequest = {
    name: '',
    stock: 0,
    stockMin: 0,
    unit: '',
    supplierIds: []
  };

  constructor(private rawMaterialService: RawMaterialService) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  loadMaterials() {
    this.rawMaterialService.getAll().subscribe({
      next: (data) => this.materials = data,
      error: (err) => console.error('Erreur backend:', err)
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onSave() {
    if (this.editingId) {

        this.rawMaterialService.update(this.editingId, this.newMaterial).subscribe({
          next: () => {
            this.loadMaterials();
            this.resetForm();
          },
          error: () => alert("Erreur lors de la modification")
        });
      } else {

        this.rawMaterialService.create(this.newMaterial).subscribe({
          next: () => {
            this.loadMaterials();
            this.resetForm();
          },
          error: () => alert("Erreur lors de l'ajout")
        });
      }
  }

  onDelete(id: number) {
    if(confirm('Voulez-vous vraiment supprimer ce matériau ?')) {
      this.rawMaterialService.delete(id).subscribe(() => this.loadMaterials());
    }
  }

  onEdit(material: RawMaterialResponse) {
      this.showForm = true;
      this.editingId = material.id;
      // Remplir le formulaire avec les valeurs actuelles
      this.newMaterial = {
        name: material.name,
        stock: material.stock,
        stockMin: material.stockMin,
        unit: material.unit,
        supplierIds: [] // Garder vide ou mapper selon vos besoins
      };
  }

  resetForm() {
    this.editingId = null;
    this.newMaterial = { name: '', stock: 0, stockMin: 0, unit: '', supplierIds: [] };
    this.showForm = false;
  }
}