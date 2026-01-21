import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {Customer, CustomerRequest} from '../model/customer.model';

export const CustomerActions = createActionGroup({
  source: 'Customer API',
  events: {
    'Load Customers': emptyProps(),
    'Load Customers Success': props<{ customers: Customer[] }>(),
    'Load Customers Failure': props<{ error: string }>(),

    'Add Customer': props<{ customer: CustomerRequest }>(),
    'Add Customer Success': props<{ customer: Customer }>(),

    'Update Customer': props<{ id: number, customer: CustomerRequest }>(),
    'Update Customer Success': props<{ customer: Customer }>(),

    'Delete Customer': props<{ id: number }>(),
    'Delete Customer Success': props<{ id: number }>(),
  }
});
