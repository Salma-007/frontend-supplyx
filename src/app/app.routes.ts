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
import {OrderListComponent} from './shared/components/order-list/order-list/order-list.component';
import {OrderFormComponent} from './shared/components/order-form/order-form/order-form.component';
import {OrderDetailComponent} from './shared/components/order-detail/order-detail/order-detail.component';
import {ProductFormComponent} from './pages/product/product-form/product-form.component';
import {ProductListComponent} from './pages/product/productlist/productlist.component';
import {
  ProductionOrderListComponent
} from './pages/production-order/production-order-list/production-order-list.component';
import {
  ProductionOrderFormComponent
} from './pages/production-order/production-order-form/production-order-form.component';
import {CustomerComponent} from './features-ngrx/customers/components/customer/customer.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'orders', component: OrderListComponent },
  { path: 'materials', component: RawMaterialListComponent },
  { path: 'suppliers', component: SupplierListComponent },
  { path: 'suppliers/new', component: SupplierFormComponent },
  { path: 'suppliers/edit/:id', component: SupplierFormComponent },
  { path: 'suppliers/:id', component: SupplierDetailComponent },
  { path: 'orders', component: OrderListComponent },
  { path: 'orders/new', component: OrderFormComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
  { path: 'users', component: UserListComponent },
  { path: 'users/new', component: UserFormComponent },
  { path: 'users/edit/:id', component: UserFormComponent },
  { path: 'users/:id', component: UserDetailComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/new', component: ProductFormComponent },
  { path: 'products/edit/:id', component: ProductFormComponent },
  { path: 'production-orders', component: ProductionOrderListComponent },
  { path: 'production-orders/new', component: ProductionOrderFormComponent },
  { path: 'production-orders/edit/:id', component: ProductionOrderFormComponent },
  { path: 'customers', component: CustomerComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
