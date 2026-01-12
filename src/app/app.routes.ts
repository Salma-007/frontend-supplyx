import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RawMaterialListComponent } from './pages/raw-material/raw-material-list/raw-material-list.component';
import {SupplierListComponent} from './pages/suppliers/supplier-list/supplier-list.component';
import {SupplierFormComponent} from './pages/suppliers/supplier-form/supplier-form.component';
import {SupplierDetailComponent} from './pages/suppliers/supplier-detail/supplier-detail.component';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserFormComponent } from './pages/user-form/user-form.component';
import { UserDetailComponent } from './pages/user-detail/user-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'materials', component: RawMaterialListComponent },
  { path: 'suppliers', component: SupplierListComponent },
  { path: 'suppliers/new', component: SupplierFormComponent },
  { path: 'suppliers/edit/:id', component: SupplierFormComponent },
  { path: 'suppliers/:id', component: SupplierDetailComponent },
  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserFormComponent },
  { path: 'users/edit/:id', component: UserFormComponent },
  { path: 'users/:id', component: UserDetailComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
