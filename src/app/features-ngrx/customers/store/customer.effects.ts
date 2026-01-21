import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { CustomerActions } from './customer.actions';
import { of } from 'rxjs';
import { catchError, mergeMap, map } from 'rxjs/operators';
import { CustomerService } from '../service/customer.service';

@Injectable()
export class CustomerEffects {

  private actions$ = inject(Actions);
  private customerService = inject(CustomerService);

  loadCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadCustomers),
      mergeMap(() =>
        this.customerService.getAll().pipe(
          map(customers =>
            CustomerActions.loadCustomersSuccess({ customers })
          ),
          catchError(error =>
            of(CustomerActions.loadCustomersFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.addCustomer),
      mergeMap(({ customer }) =>
        this.customerService.create(customer).pipe(
          map(newCustomer =>
            CustomerActions.addCustomerSuccess({ customer: newCustomer })
          )
        )
      )
    )
  );

  deleteCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.deleteCustomer),
      mergeMap(({ id }) =>
        this.customerService.delete(id).pipe(
          map(() =>
            CustomerActions.deleteCustomerSuccess({ id })
          )
        )
      )
    )
  );
}
