import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../interceptors/auth/auth.interceptor';
import { refreshInterceptor } from '../interceptors/refresh/refresh.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
              provideHttpClient(
                withInterceptors([
                  authInterceptor,
                  refreshInterceptor
                ])
              )
  ]
};

