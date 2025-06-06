import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GeneroMusicalDTO } from '../interfaces/GeneroMusicalDTO';
import { GeneroMusical } from '../interfaces/GeneroMusical';

@Injectable({
  providedIn: 'root'
})
export class GenerosMusicalesService {
  constructor(private http: HttpClient) { }

  // Para el endpoint original (solo lista nombres)
  private apiUrl: string = `http://localhost:8081/genero`;

  // Para el nuevo endpoint CRUD completo (con id y nombre)
  private apiAdminUrl: string = `http://localhost:8081/genero-admin`;

  listarGeneros(): Observable<GeneroMusical[]> {
    const headers = this.getHeaders();
    return this.http.get<GeneroMusicalDTO[]>(`${this.apiUrl}/listar-generos`, { headers });
  }

  listarGenerosConId(): Observable<GeneroMusicalDTO[]> {
    const headers = this.getHeaders();
    return this.http.get<GeneroMusicalDTO[]>(`${this.apiAdminUrl}/listar`, { headers });
  }

  crearGenero(nombre: string): Observable<any> {
    return this.http.post<any>('http://localhost:8081/genero-admin/crear', {
      nombre: nombre
    });
  }



  actualizarGenero(genero: GeneroMusicalDTO): Observable<GeneroMusicalDTO> {
    return this.http.put<GeneroMusicalDTO>(`${this.apiAdminUrl}/actualizar`, genero, {
      headers: this.getHeaders()
    });
  }

  eliminarGenero(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiAdminUrl}/eliminar/${id}`, {
      headers: this.getHeaders()
    });
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
