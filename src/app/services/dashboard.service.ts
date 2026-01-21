import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupplierService } from './supplier.service';
import { RawMaterialService } from './raw-material.service';
import { SupplyOrderService } from './supply-order.service';
import { DashboardStats } from '../models/dashboard-stats.module';
import { SupplyOrderStatus } from '../enums/supply-order-status';
import {CustomerService} from './customer.service';
import {SalesOrderService} from './order.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(
    private supplierService: SupplierService,
    private rawMaterialService: RawMaterialService,
    private supplyOrderService: SupplyOrderService,
    private customerService: CustomerService,
    private salesOrderService: SalesOrderService
  ) {}

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      suppliers: this.supplierService.getAllSuppliers(),
      rawMaterials: this.rawMaterialService.getAll(),
      orders: this.supplyOrderService.getAllOrders(),
      customers: this.customerService.getAll(),
      salesOrders: this.salesOrderService.getAll()
    }).pipe(
      map(({ suppliers, rawMaterials, orders , customers, salesOrders}) => ({
        totalSuppliers: suppliers.length,
        totalRawMaterials: rawMaterials.length,
        criticalStockCount: rawMaterials.filter(
          m => m.stock < m.stockMin
        ).length,
        ordersEnAttente: orders.filter(o => o.status === SupplyOrderStatus.EN_ATTENTE).length,
        ordersEnCours: orders.filter(o => o.status === SupplyOrderStatus.EN_COURS).length,
        ordersRecues: orders.filter(o => o.status === SupplyOrderStatus.RECUE).length,
        totalCustomers: customers.length,
        totalSalesOrders: salesOrders.length
      }))
    );
  }
}
