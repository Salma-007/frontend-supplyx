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
    this.rawMaterialService.create(this.newMaterial).subscribe({
      next: () => {
        this.loadMaterials(); // Rafraîchir
        this.newMaterial = { name: '', stock: 0, stockMin: 0, unit: '', supplierIds: [] }; // Reset
        this.showForm = false;
      },
      error: (err) => alert("Erreur lors de l'ajout")
    });
  }

  onDelete(id: number) {
    if(confirm('Voulez-vous vraiment supprimer ce matériau ?')) {
      this.rawMaterialService.delete(id).subscribe(() => this.loadMaterials());
    }
  }

  onEdit(material: RawMaterialResponse) {
    // Logique pour remplir le formulaire avec les données existantes
    alert("Modification pour " + material.name + " (À implémenter)");
  }
}