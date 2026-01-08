import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../app/auth/services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router'; 

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router); 
  const accessToken = authService.getAccessToken();

  if (!accessToken && !req.url.includes('/api/auth/')) {
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('No token available'));
  }

  let authReq = req;
  if (accessToken && !req.url.includes('/api/auth/')) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/api/auth/')) {
        return handle401Error(authReq, next, authService, router); 
      }
      return throwError(() => error);
    })
  );
};

const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router) => {
  return authService.refreshToken().pipe(
    switchMap((response) => {
      authService.saveTokens(response.accessToken, response.refreshToken);
      const newAuthReq = request.clone({
        setHeaders: { Authorization: `Bearer ${response.accessToken}` }
      });
      return next(newAuthReq);
    }),
    catchError((refreshError) => {
      authService.logout();
      router.navigate(['/login']); 
      return throwError(() => refreshError);
    })
  );
};