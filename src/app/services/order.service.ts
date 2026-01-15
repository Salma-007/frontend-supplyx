import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {OrderRequest, OrderResponse, OrderStatus} from '../models/order.module';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SalesOrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  getAll(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  create(order: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, order);
  }

  update(id: number, order: OrderRequest): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.apiUrl}/${id}`, order);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cancelOrder(id: number): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  updateStatus(id: number, status: OrderStatus): Observable<OrderResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}/update-status`, { params });
  }
}
