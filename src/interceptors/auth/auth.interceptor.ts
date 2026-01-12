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

  // Pour les requêtes de refresh, on ne fait pas de vérification de token
  if (isRefreshRequest) {
    return next(req);
  }

  // Si pas de token et pas une requête d'auth, rediriger vers login
  if (!accessToken && !isAuthRequest) {
    authService.logout();
    router.navigate(['/login']);
    return EMPTY;
  }

  // Ajouter le token aux requêtes non-auth
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

    // Si pas de refresh token, logout et redirection
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

          // Rejouer la requête originale avec le nouveau token
          return next(request.clone({
            setHeaders: { Authorization: `Bearer ${response.accessToken}` }
          }));
        } else {
          // Tokens invalides reçus
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
        return EMPTY; // Retourner EMPTY au lieu de throwError pour éviter les erreurs console
      })
    );
  }

  // Si un refresh est déjà en cours, attendre le nouveau token
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
