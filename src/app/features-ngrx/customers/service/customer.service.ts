import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Customer, CustomerRequest} from '../model/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = 'http://localhost:8080/api/customers';

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Customer[]>(this.apiUrl); }
  getById(id: number) { return this.http.get<Customer>(`${this.apiUrl}/${id}`); }
  create(customer: CustomerRequest) { return this.http.post<Customer>(this.apiUrl, customer); }
  update(id: number, customer: CustomerRequest) { return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer); }
  delete(id: number) { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
