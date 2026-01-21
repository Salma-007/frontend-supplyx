import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { CustomerActions } from './customer.actions';
import {Customer} from '../model/customer.model';

export interface CustomerState extends EntityState<Customer> {
  loading: boolean;
  error: any;
}

export const adapter = createEntityAdapter<Customer>();

export const initialState: CustomerState = adapter.getInitialState({
  loading: false,
  error: null
});

export const customerReducer = createReducer(
  initialState,
  on(CustomerActions.loadCustomers, (state) => ({ ...state, loading: true })),
  on(CustomerActions.loadCustomersSuccess, (state, { customers }) => adapter.setAll(customers, { ...state, loading: false })),
  on(CustomerActions.addCustomerSuccess, (state, { customer }) => adapter.addOne(customer, state)),
  on(CustomerActions.updateCustomerSuccess, (state, { customer }) => adapter.updateOne({ id: customer.id, changes: customer }, state)),
  on(CustomerActions.deleteCustomerSuccess, (state, { id }) => adapter.removeOne(id, state))
);
