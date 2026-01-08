import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawMaterialRequest, RawMaterialResponse } from '../models/raw-material.model';

@Injectable({
  providedIn: 'root'
})
export class RawMaterialService {
  private apiUrl = 'http://localhost:8080/api/raw-materials'; 

  constructor(private http: HttpClient) { }

  // GET ALL
  getAll(): Observable<RawMaterialResponse[]> {
    return this.http.get<RawMaterialResponse[]>(this.apiUrl);
  }

  // CREATE
  create(data: RawMaterialRequest): Observable<RawMaterialResponse> {
    return this.http.post<RawMaterialResponse>(this.apiUrl, data);
  }

  // UPDATE
  update(id: number, data: RawMaterialRequest): Observable<RawMaterialResponse> {
    return this.http.put<RawMaterialResponse>(`${this.apiUrl}/${id}`, data);
  }

  // DELETE
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}