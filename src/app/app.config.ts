import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth/auth.interceptor';
import { routes } from './app.routes';
import {provideEffects} from '@ngrx/effects';
import {CustomerEffects} from './features-ngrx/customers/store/customer.effects';
import {customerReducer} from './features-ngrx/customers/store/customer.reducer';
import {provideStore} from '@ngrx/store';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    ),
    provideStore({
      customers: customerReducer
    }),
    provideEffects(CustomerEffects)
  ]
};
