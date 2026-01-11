import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RawMaterialListComponent } from './pages/raw-material/raw-material-list/raw-material-list.component';
import {SupplierListComponent} from './pages/suppliers/supplier-list/supplier-list.component';
import {SupplierFormComponent} from './pages/suppliers/supplier-form/supplier-form.component';
import {SupplierDetailComponent} from './pages/suppliers/supplier-detail/supplier-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'materials', component: RawMaterialListComponent },
  { path: 'suppliers', component: SupplierListComponent },
  { path: 'suppliers/new', component: SupplierFormComponent },
  { path: 'suppliers/edit/:id', component: SupplierFormComponent },
  { path: 'suppliers/:id', component: SupplierDetailComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
