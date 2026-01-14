import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductionOrderRequest, ProductionOrderResponse } from '../models/production-order.module';

@Injectable({ providedIn: 'root' })
export class ProductionOrderService {
  private apiUrl = 'http://localhost:8080/api/production-orders';

  constructor(private http: HttpClient) {}

  getAll(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ProductionOrderResponse> {
    return this.http.get<ProductionOrderResponse>(`${this.apiUrl}/${id}`);
  }

  create(order: ProductionOrderRequest): Observable<ProductionOrderResponse> {
    return this.http.post<ProductionOrderResponse>(this.apiUrl, order);
  }

  update(id: number, order: ProductionOrderRequest): Observable<ProductionOrderResponse> {
    return this.http.put<ProductionOrderResponse>(`${this.apiUrl}/${id}`, order);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  blockOrder(id: number): Observable<ProductionOrderResponse> {
    return this.http.patch<ProductionOrderResponse>(`${this.apiUrl}/${id}/block`, {});
  }

  updateStatus(id: number, status: string): Observable<ProductionOrderResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ProductionOrderResponse>(`${this.apiUrl}/${id}/update-status`, { params });
  }
}
