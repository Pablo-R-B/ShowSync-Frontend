import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, Observable} from 'rxjs';
import { Sala } from '../interfaces/sala';

@Injectable({ providedIn: 'root' })
export class SalasService {
  private apiUrl = 'api/salas';

  constructor(private http: HttpClient) {}

  private obtenerToken(): string {
    return localStorage.getItem('token') || '';
  }

  //private getAuthHeaders(): HttpHeaders {
   // return new HttpHeaders().set('Authorization', 'Bearer ' + this.obtenerToken());
  //}
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token no encontrado');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
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
    // Construye los parámetros correctamente
    let params = new HttpParams()
      .set('salaId', salaId.toString())
      .set('fechaInicio', fechaInicio);

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    // Asegúrate de que la URL coincida con el endpoint del backend
    return this.http.get<any[]>(`http://localhost:8081/salas/disponibilidad`, {
      params,
      headers: this.getAuthHeaders() // Verifica que esto incluya el token
    }).pipe(
      catchError(error => {
        console.error('Error en consultarDisponibilidad:', error);
        throw error;
      })
    );
  }

  obtenerFechasNoDisponibles(salaId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8081/salas/${salaId}/fechas-no-disponibles`, {
      headers: this.getAuthHeaders()
    });
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






}
