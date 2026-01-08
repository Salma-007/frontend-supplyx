import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { RawMaterialListComponent } from './pages/raw-material/raw-material-list/raw-material-list.component'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'materials', component: RawMaterialListComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
