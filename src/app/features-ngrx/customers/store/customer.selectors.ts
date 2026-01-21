import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CustomerState, adapter } from './customer.reducer';

export const selectCustomerState = createFeatureSelector<CustomerState>('customers');

const { selectAll } = adapter.getSelectors();

export const selectAllCustomers = createSelector(
  selectCustomerState,
  selectAll
);

export const selectCustomerLoading = createSelector(
  selectCustomerState,
  (state) => state.loading
);
