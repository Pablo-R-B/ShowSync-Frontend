import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SalaService {
  private apiUrl = 'http://localhost:8081/salas';

  constructor(private http: HttpClient) {}

  // Crear sala
  crear(sala: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, sala);
  }

  // Editar sala
  editar(id: number, sala: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/editar/${id}`, sala);
  }

  // Eliminar sala
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`);
  }

  // Obtener sala por ID
  obtenerPorId(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Obtener todas las salas
  obtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/todas`);
  }

  // Buscar salas por texto
  buscarSalas(filtro: string): Observable<any[]> {
    const params = new HttpParams().set('filtro', filtro);
    return this.http.get<any[]>(`${this.apiUrl}/buscar`, { params });
  }

  // Filtrar por capacidad
  filtrarPorCapacidad(capacidadMin: number, capacidadMax: number): Observable<any[]> {
    const params = new HttpParams()
      .set('capacidadMinima', capacidadMin.toString())
      .set('capacidadMaxima', capacidadMax.toString());
    return this.http.get<any[]>(`${this.apiUrl}/filtrar`, { params });
  }

  // Consultar disponibilidad
  consultarDisponibilidad(salaId: number, fechaInicio: string, fechaFin: string): Observable<any[]> {
    const params = new HttpParams()
      .set('salaId', salaId.toString())
      .set('fechaInicio', fechaInicio)
      .set('fechaFin', fechaFin);
    return this.http.get<any[]>(`${this.apiUrl}/disponibilidad`, { params });
  }
}
