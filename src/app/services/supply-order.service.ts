import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import {
  SupplyOrderRequest,
  SupplyOrderResponse,
  SupplyOrderSearchFilters
} from '../models/supply-order.module';
import { SupplyOrderStatus } from '../enums/supply-order-status';

@Injectable({
  providedIn: 'root'
})
export class SupplyOrderService {

  // URL de base calquée sur votre structure UserService
  private readonly apiUrl = 'http://localhost:8080/api/supply-orders';

  private ordersCache$ = new BehaviorSubject<SupplyOrderResponse[]>([]);
  public orders$ = this.ordersCache$.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Crée une nouvelle commande
   */
  createOrder(order: SupplyOrderRequest): Observable<SupplyOrderResponse> {
    return this.http.post<SupplyOrderResponse>(this.apiUrl, order).pipe(
      tap(newOrder => {
        this.ordersCache$.next([...this.ordersCache$.value, newOrder]);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère toutes les commandes avec gestion du cache
   */
  getAllOrders(forceRefresh: boolean = false): Observable<SupplyOrderResponse[]> {
    if (this.ordersCache$.value.length > 0 && !forceRefresh) {
      return this.orders$;
    }

    return this.http.get<SupplyOrderResponse[]>(this.apiUrl).pipe(
      tap(orders => this.ordersCache$.next(orders)),
      catchError(this.handleError)
    );
  }

  /**
   * Récupère une commande par ID (Cache first)
   */
  getOrderById(id: number): Observable<SupplyOrderResponse> {
    const cachedOrder = this.ordersCache$.value.find(o => o.id === id);
    if (cachedOrder) {
      return new Observable(observer => {
        observer.next(cachedOrder);
        observer.complete();
      });
    }

    return this.http.get<SupplyOrderResponse>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour le statut d'une commande (Endpoint spécifique)
   */
  updateOrderStatus(orderId: number, newStatus: SupplyOrderStatus): Observable<SupplyOrderResponse> {
    const params = new HttpParams().set('status', newStatus);

    // Utilisation de l'endpoint : /api/supply-orders/{id}/update-status
    return this.http.get<SupplyOrderResponse>(`${this.apiUrl}/${orderId}/update-status`, { params }).pipe(
      tap(updatedOrder => {
        const orders = this.ordersCache$.value;
        const index = orders.findIndex(o => o.id === orderId);

        if (index !== -1) {
          orders[index] = updatedOrder;
          this.ordersCache$.next([...orders]);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Supprime une commande
   */
  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.ordersCache$.next(
          this.ordersCache$.value.filter(o => o.id !== id)
        );
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Filtrage local (Client-side)
   */
  filterOrders(filters: SupplyOrderSearchFilters): Observable<SupplyOrderResponse[]> {
    return this.orders$.pipe(
      map(orders => this.applyFilters(orders, filters))
    );
  }

  private applyFilters(orders: SupplyOrderResponse[], filters: SupplyOrderSearchFilters): SupplyOrderResponse[] {
    let filtered = [...orders];

    // Recherche par ID ou nom de matière
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.id.toString().includes(search) ||
        order.orderItems.some(item => item.materialName.toLowerCase().includes(search))
      );
    }

    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    // Filtre par fournisseur
    if (filters.supplierId) {
      filtered = filtered.filter(order => order.supplierId === filters.supplierId);
    }

    // Tri
    if (filters.sortBy) {
      filtered = this.sortOrders(
        filtered,
        filters.sortBy,
        filters.sortOrder || 'desc'
      );
    }

    return filtered;
  }

  private sortOrders(
    orders: SupplyOrderResponse[],
    sortBy: 'orderdate' | 'status' | 'supplierId',
    sortOrder: 'asc' | 'desc'
  ): SupplyOrderResponse[] {
    return orders.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'orderdate') {
        comparison = new Date(a.orderdate).getTime() - new Date(b.orderdate).getTime();
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else {
        comparison = a[sortBy] < b[sortBy] ? -1 : 1;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Statistiques calquées sur le besoin métier
   */
  getOrdersStatistics(): Observable<{
    total: number;
    enAttente: number;
    enCours: number;
    recues: number;
  }> {
    return this.orders$.pipe(
      map(orders => ({
        total: orders.length,
        enAttente: orders.filter(o => o.status === SupplyOrderStatus.EN_ATTENTE).length,
        enCours: orders.filter(o => o.status === SupplyOrderStatus.EN_COURS).length,
        recues: orders.filter(o => o.status === SupplyOrderStatus.RECUE).length
      }))
    );
  }

  clearCache(): void {
    this.ordersCache$.next([]);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client : ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Données de commande invalides';
          break;
        case 404:
          errorMessage = 'Commande non trouvée';
          break;
        case 409:
          errorMessage = 'Conflit : La commande ne peut plus être modifiée';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        default:
          errorMessage = error.error?.message || 'Erreur inconnue';
      }
    }

    console.error('SupplyOrderService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
