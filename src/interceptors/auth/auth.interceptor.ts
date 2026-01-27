import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../app/auth/services/auth.service';
import { catchError, switchMap, throwError, EMPTY, BehaviorSubject, filter, take } from 'rxjs';
import { Router } from '@angular/router';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const accessToken = authService.getAccessToken();

  // URLs qui ne nécessitent pas d'authentification
  const isAuthRequest = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register');
  const isRefreshRequest = req.url.includes('/api/auth/refresh');


  if (isRefreshRequest) {
    return next(req);
  }

  if (!accessToken && !isAuthRequest) {
    authService.logout();
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
    refreshTokenSubject.next(null);

    const refreshToken = authService.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      authService.logout();
      router.navigate(['/login']);
      return EMPTY;
    }

    return authService.refreshToken().pipe(
      switchMap((response) => {
        isRefreshing = false;

        if (response.accessToken && response.refreshToken) {
          authService.saveTokens(response.accessToken, response.refreshToken);
          refreshTokenSubject.next(response.accessToken);

          return next(request.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` }
          }));
        } else {
          authService.logout();
          router.navigate(['/login']);
          return EMPTY;
        }
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.logout();
        router.navigate(['/login']);
        return EMPTY;
      })
    );
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap((token) => {
      return next(request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      }));
    })
  );
};
