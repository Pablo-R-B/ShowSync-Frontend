import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sala } from '../interfaces/sala';

@Injectable({ providedIn: 'root' })
export class SalasService {
  private apiUrl = 'api/salas';

  constructor(private http: HttpClient) {}

  private obtenerToken(): string {
    return localStorage.getItem('token') || '';
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', 'Bearer ' + this.obtenerToken());
  }

  crear(sala: Sala): Observable<Sala> {
    return this.http.post<Sala>(`${this.apiUrl}/crear`, sala, { headers: this.getAuthHeaders() });
  }

  editar(id: number, sala: Sala): Observable<Sala> {
    return this.http.put<Sala>(`${this.apiUrl}/editar/${id}`, sala, { headers: this.getAuthHeaders() });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`, { headers: this.getAuthHeaders() });
  }

  obtenerPorId(id: number): Observable<Sala> {
    return this.http.get<Sala>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  obtenerTodas(): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/todas`, { headers: this.getAuthHeaders() });
  }

  buscarSalas(filtro: string): Observable<Sala[]> {
    const params = new HttpParams().set('filtro', filtro);
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar`, { params, headers: this.getAuthHeaders() });
  }

  filtrarPorCapacidad(capacidadMin: number, capacidadMax: number): Observable<Sala[]> {
    const params = new HttpParams()
      .set('capacidadMinima', capacidadMin.toString())
      .set('capacidadMaxima', capacidadMax.toString());
    return this.http.get<Sala[]>(`${this.apiUrl}/filtrar`, { params, headers: this.getAuthHeaders() });
  }

  consultarDisponibilidad(salaId: number, fechaInicio: string, fechaFin?: string): Observable<any[]> {
    const params = new HttpParams()
      .set('salaId', salaId.toString())
      .set('fechaInicio', fechaInicio);
    if (fechaFin) {
      params.set('fechaFin', fechaFin);
    }
    return this.http.get<any[]>(`${this.apiUrl}/disponibilidad`, { params, headers: this.getAuthHeaders() });
  }

  obtenerSalasPorPromotor(promotorId: number): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/promotor/${promotorId}`, {
      headers: this.getAuthHeaders()
    });
  }

  confirmarSala(salaId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/confirmar/${salaId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  rechazarSala(salaId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rechazar/${salaId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }



  buscarSalasPorCiudad(ciudad: string): Observable<Sala[]> {
    const params = new HttpParams().set('ciudad', ciudad);
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar-por-ciudad`, { params, headers: this.getAuthHeaders() });
  }

  buscarSalasPorProvincia (provincia: string): Observable<Sala[]> {
    const params = new HttpParams().set('provincia', provincia);
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar-por-provincia`, { params, headers: this.getAuthHeaders() });
  }



  getSalas(): Observable<{ id: number; nombre: string }[]> {
    return this.http.get<{ id: number; nombre: string }[]>(`${this.apiUrl}/todas`);
  }

  // Obtener sala
  obtenerSalas(promotorId: number): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/promotor/${promotorId}`);
  }



}
