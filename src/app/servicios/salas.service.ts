import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Sala} from '../interfaces/Sala';


@Injectable({ providedIn: 'root' })
export class SalasService {
  private apiUrl = '/api/salas';

  constructor(private http: HttpClient) {}

  private obtenerToken(): string {
    return localStorage.getItem('token') || '';
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', 'Bearer ' + this.obtenerToken());
  }

  crear(sala: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, sala, { headers: this.getAuthHeaders() });
  }

  editar(id: number, sala: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/editar/${id}`, sala, { headers: this.getAuthHeaders() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`, { headers: this.getAuthHeaders() });
  }

  obtenerPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  obtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/todas`, { headers: this.getAuthHeaders() });
  }

  buscarSalas(filtro: string): Observable<any[]> {
    const params = new HttpParams().set('filtro', filtro);
    return this.http.get<any[]>(`${this.apiUrl}/buscar`, { params, headers: this.getAuthHeaders() });
  }

  filtrarPorCapacidad(capacidadMin: number, capacidadMax: number): Observable<any[]> {
    const params = new HttpParams()
      .set('capacidadMinima', capacidadMin.toString())
      .set('capacidadMaxima', capacidadMax.toString());
    return this.http.get<any[]>(`${this.apiUrl}/filtrar`, { params, headers: this.getAuthHeaders() });
  }

  consultarDisponibilidad(salaId: number, fechaInicio: string, fechaFin: string): Observable<any[]> {
    const params = new HttpParams()
      .set('salaId', salaId.toString())
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<any[]>(`${this.apiUrl}/disponibilidad`, { params, headers: this.getAuthHeaders() });
  }

  getSalaById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getDisponibilidad(id: string, inicio: string, fin: string) {
    const params = new HttpParams()
      .set('salaId', id)
      .set('fechaInicio', inicio)
      .set('fechaFin', fin);
    return this.http.get<any[]>(`${this.apiUrl}/disponibilidad`, { params, headers: this.getAuthHeaders() });
  }


  // Obtener sala
  obtenerSalas(promotorId: number): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/salas/promotor/${promotorId}`);
  }


  // confirmar sala
  confirmarSala(salaId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${salaId}/confirmar`, {});
  }
}
