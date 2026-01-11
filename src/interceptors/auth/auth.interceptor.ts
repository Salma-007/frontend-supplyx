import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../app/auth/services/auth.service';
import { catchError, switchMap, throwError, EMPTY } from 'rxjs';
import { Router } from '@angular/router'; 

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const accessToken = authService.getAccessToken();

  const isAuthRequest = req.url.includes('/api/auth/');

  if (!accessToken && !isAuthRequest) {
    router.navigate(['/login']);
    return EMPTY; 
  }

  let authReq = req;
  if (accessToken && !isAuthRequest) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` }
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest) {
        return handle401Error(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

const handle401Error = (request: HttpRequest<any>, next: HttpHandlerFn, authService: AuthService, router: Router) => {
  if (!isRefreshing) {
    isRefreshing = true;

    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;

        if (response.accessToken && response.refreshToken) {
            authService.saveTokens(response.accessToken, response.refreshToken);
            return next(request.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` }
            }));
        } else {
            throw new Error("Invalid tokens received");
        }
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => refreshError);
      })
    );
  }
  
  return next(request).pipe(
    catchError(err => {
      authService.logout();
      router.navigate(['/login']);
      return throwError(() => err);
    })
  );
};