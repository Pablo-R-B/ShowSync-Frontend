import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { Sala } from '../interfaces/sala';
import {SalaEstadoCantidad} from '../interfaces/SalaEstadoCantidad';

// Interfaces para la paginación
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  termino?: string;
}

@Injectable({ providedIn: 'root' })
export class SalasService {
  private apiUrl = 'api/salas';

  constructor(private http: HttpClient) {}

  private obtenerToken(): string {
    return localStorage.getItem('token') || '';
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token no encontrado');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  crear(sala: Sala, imagen: File): Observable<Sala> {
    const formData = new FormData();

    // Agregamos los datos como JSON
    const salaBlob = new Blob([JSON.stringify(sala)], { type: 'application/json' });
    formData.append('data', salaBlob);

    // Agregamos la imagen
    formData.append('imagen', imagen);

    // No se agrega manualmente el Content-Type, Angular lo hace por nosotros
    return this.http.post<Sala>(`${this.apiUrl}/crear`, formData, {
      headers: this.getAuthHeaders()
    });
  }


  editar(id: number, sala: Sala, imagenArchivo?: File): Observable<Sala> {
    const formData = new FormData();

    // Convertir el objeto sala a JSON y añadirlo como un Blob
    const salaBlob = new Blob([JSON.stringify(sala)], { type: 'application/json' });
    formData.append('sala', salaBlob);

    // Si hay una imagen, adjuntarla
    if (imagenArchivo) {
      formData.append('imagenArchivo', imagenArchivo);
    }

    return this.http.put<Sala>(`${this.apiUrl}/editar/${id}`, formData, {
      headers: {
        // ¡No pongas Content-Type a mano! Angular lo gestiona con FormData
        Authorization: this.getAuthHeaders().get('Authorization') || ''
      }
    });
  }


  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`, { headers: this.getAuthHeaders() });
  }

  obtenerPorId(id: number): Observable<Sala> {
    return this.http.get<Sala>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Método original sin paginación (para compatibilidad)
  obtenerTodas(): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/todas`, { headers: this.getAuthHeaders() });
  }

  // Nuevo método con paginación
  obtenerTodasPaginadas(params: PaginationParams = {}): Observable<Sala[]> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 6).toString());

    if (params.termino && params.termino.trim()) {
      httpParams = httpParams.set('termino', params.termino.trim());
    }

    return this.http.get<Sala[]>(`${this.apiUrl}/todas`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  // Búsqueda sin paginación (método original)
  buscarSalas(filtro: string): Observable<Sala[]> {
    const params = new HttpParams().set('filtro', filtro);
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar`, { params, headers: this.getAuthHeaders() });
  }

  // Búsqueda con paginación
  buscarSalasPaginadas(filtro: string, params: PaginationParams = {}): Observable<PageResponse<Sala>> {
    let httpParams = new HttpParams()
      .set('filtro', filtro)
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 6).toString());

    return this.http.get<PageResponse<Sala>>(`${this.apiUrl}/buscar-paginado`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  // Filtrado por capacidad sin paginación (método original)
  filtrarPorCapacidad(capacidadMin: number, capacidadMax: number): Observable<Sala[]> {
    const params = new HttpParams()
      .set('capacidadMinima', capacidadMin.toString())
      .set('capacidadMaxima', capacidadMax.toString());
    return this.http.get<Sala[]>(`${this.apiUrl}/filtrar`, { params, headers: this.getAuthHeaders() });
  }

  // Filtrado por capacidad con paginación
  filtrarPorCapacidadPaginado(
    capacidadMin: number,
    capacidadMax: number,
    params: PaginationParams = {}
  ): Observable<Sala[]> {
    let httpParams = new HttpParams()
      .set('capacidadMinima', capacidadMin.toString())
      .set('capacidadMaxima', capacidadMax.toString())
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 6).toString());

    if (params.termino && params.termino.trim()) {
      httpParams = httpParams.set('termino', params.termino.trim());
    }

    return this.http.get<Sala[]>(`${this.apiUrl}/filtrar`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  // Búsqueda por ciudad sin paginación (método original)
  buscarSalasPorCiudad(ciudad: string): Observable<Sala[]> {
    const params = new HttpParams().set('ciudad', ciudad);
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar-por-ciudad`, { params, headers: this.getAuthHeaders() });
  }

  // Búsqueda por ciudad con paginación
  buscarSalasPorCiudadPaginadas(ciudad: string, params: PaginationParams = {}): Observable<PageResponse<Sala>> {
    let httpParams = new HttpParams()
      .set('ciudad', ciudad)
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 6).toString());

    return this.http.get<PageResponse<Sala>>(`${this.apiUrl}/buscar-por-ciudad-paginado`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  // Búsqueda por provincia sin paginación (método original)
  buscarSalasPorProvincia(provincia: string): Observable<Sala[]> {
    const params = new HttpParams().set('provincia', provincia);
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar-por-provincia`, { params, headers: this.getAuthHeaders() });
  }

  // Búsqueda por provincia con paginación
  buscarSalasPorProvinciaPaginadas(provincia: string, params: PaginationParams = {}): Observable<PageResponse<Sala>> {
    let httpParams = new HttpParams()
      .set('provincia', provincia)
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 6).toString());

    return this.http.get<PageResponse<Sala>>(`${this.apiUrl}/buscar-por-provincia-paginado`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  consultarDisponibilidad(salaId: number, fechaInicio: string, fechaFin?: string): Observable<any[]> {
    let params = new HttpParams()
      .set('salaId', salaId.toString())
      .set('fechaInicio', fechaInicio);

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get<any[]>(`http://localhost:8081/salas/disponibilidad`, {
      params,
      headers: this.getAuthHeaders()
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

  obtenerCantidadReservasPorSala(): Observable<Object[]> {
    return this.http.get<Object[]>(`${this.apiUrl}/reservas`, {
      headers: this.getAuthHeaders()
    });
  }

  getDatosGrafica(): Observable<SalaEstadoCantidad[]> {
    return this.http.get<SalaEstadoCantidad[]>('/api/salas/reservas-estado');
  }



}
