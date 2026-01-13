import { Pipe, PipeTransform } from '@angular/core';
import { SupplyOrderStatus } from '../enums/supply-order-status';

@Pipe({
  name: 'orderStatusCount',
  standalone: true
})
export class OrderStatusCountPipe implements PipeTransform {

  transform(orders: any[], status: SupplyOrderStatus): number {
    if (!orders) return 0;
    return orders.filter(o => o.status === status).length;
  }
}
