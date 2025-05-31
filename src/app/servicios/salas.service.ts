import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { Sala } from '../interfaces/sala';
import {SalaEstadoCantidad} from '../interfaces/SalaEstadoCantidad';
import {RespuestaPaginada} from '../interfaces/respuesta-paginada';
import {PaginationParams} from '../interfaces/PaginationParams';
import {DisponibilidadSala} from '../interfaces/disponibilidadSala';



@Injectable({ providedIn: 'root' })
export class SalasService {
  private apiUrl = 'api/salas';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token no encontrado');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }


  // Métodos CRUD básicos (sin cambios)
  crear(sala: Sala, imagen: File): Observable<Sala> {
    const formData = new FormData();
    const salaBlob = new Blob([JSON.stringify(sala)], { type: 'application/json' });
    formData.append('data', salaBlob);
    formData.append('imagen', imagen);

    return this.http.post<Sala>(`${this.apiUrl}/crear`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  editar(id: number, sala: Sala, imagenArchivo?: File): Observable<Sala> {
    const formData = new FormData();
    const salaBlob = new Blob([JSON.stringify(sala)], { type: 'application/json' });
    formData.append('sala', salaBlob);

    if (imagenArchivo) {
      formData.append('imagenArchivo', imagenArchivo);
    }

    return this.http.put<Sala>(`${this.apiUrl}/editar/${id}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/eliminar/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
  obtenerPorId(id: number): Observable<Sala> {
    return this.http.get<Sala>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }




  // Métodos de paginación mejorados
  obtenerTodasPaginadas(params: PaginationParams = {}): Observable<RespuestaPaginada<Sala>> {
    let httpParams = new HttpParams()
      .set('page', params.page?.toString() || '0')
      .set('size', params.size?.toString() || '6')
      .set('sortField', params.sortField || 'nombre')
      .set('sortDirection', params.sortDirection || 'ASC');

    if (params.termino) {
      httpParams = httpParams.set('termino', params.termino);
    }

    return this.http.get<RespuestaPaginada<Sala>>(`${this.apiUrl}/todas`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  // Búsqueda con paginación
  buscarSalasPaginadas(filtro: string, params: PaginationParams = {}): Observable<RespuestaPaginada<Sala>> {
    let httpParams = new HttpParams()
      .set('filtro', filtro)
      .set('page', params.page?.toString() || '0')
      .set('size', params.size?.toString() || '6')
      .set('sortField', params.sortField || 'nombre')
      .set('sortDirection', params.sortDirection || 'ASC');

    return this.http.get<RespuestaPaginada<Sala>>(`${this.apiUrl}/buscar-paginado`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

// Filtrado por capacidad con paginación
  filtrarPorCapacidadPaginado(
    capacidadMin: number,
    capacidadMax: number,
    params: PaginationParams = {}
  ): Observable<RespuestaPaginada<Sala>> {
    let httpParams = new HttpParams()
      .set('capacidadMinima', capacidadMin.toString())
      .set('capacidadMaxima', capacidadMax.toString())
      .set('page', params.page?.toString() || '0')
      .set('size', params.size?.toString() || '6')
      .set('sortField', params.sortField || 'capacidad')
      .set('sortDirection', params.sortDirection || 'ASC');

    if (params.termino) {
      httpParams = httpParams.set('termino', params.termino);
    }

    return this.http.get<RespuestaPaginada<Sala>>(`${this.apiUrl}/filtrar`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  buscarSalasPorCiudadPaginadas(ciudad: string, params: PaginationParams = {}): Observable<RespuestaPaginada<Sala>> {
    let httpParams = new HttpParams()
      .set('ciudad', ciudad)
      .set('page', params.page?.toString() || '0')
      .set('size', params.size?.toString() || '6')
      .set('sortField', params.sortField || 'nombre')
      .set('sortDirection', params.sortDirection || 'ASC');

    return this.http.get<RespuestaPaginada<Sala>>(`${this.apiUrl}/buscar-por-ciudad-paginado`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }

  buscarSalasPorProvinciaPaginadas(provincia: string, params: PaginationParams = {}): Observable<RespuestaPaginada<Sala>> {
    let httpParams = new HttpParams()
      .set('provincia', provincia)
      .set('page', params.page?.toString() || '0')
      .set('size', params.size?.toString() || '6')
      .set('sortField', params.sortField || 'nombre')
      .set('sortDirection', params.sortDirection || 'ASC');

    return this.http.get<RespuestaPaginada<Sala>>(`${this.apiUrl}/buscar-por-provincia-paginado`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }


  // Método original sin paginación (para compatibilidad)
  obtenerTodas(): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/todas`, {
      headers: this.getAuthHeaders()
    });
  }

  buscarSalas(filtro: string): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar`, {
      params: new HttpParams().set('filtro', filtro),
      headers: this.getAuthHeaders()
    });
  }

  filtrarPorCapacidad(capacidadMin: number, capacidadMax: number): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/filtrar`, {
      params: new HttpParams()
        .set('capacidadMinima', capacidadMin.toString())
        .set('capacidadMaxima', capacidadMax.toString()),
      headers: this.getAuthHeaders()
    });
  }

  buscarSalasPorCiudad(ciudad: string): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar-por-ciudad`, {
      params: new HttpParams().set('ciudad', ciudad),
      headers: this.getAuthHeaders()
    });
  }

  buscarSalasPorProvincia(provincia: string): Observable<Sala[]> {
    return this.http.get<Sala[]>(`${this.apiUrl}/buscar-por-provincia`, {
      params: new HttpParams().set('provincia', provincia),
      headers: this.getAuthHeaders()
    });
  }


  // Métodos de disponibilidad y otros

  consultarDisponibilidad(salaId: number, fechaInicio: string): Observable<DisponibilidadSala> {
    return this.http.get<DisponibilidadSala>(`${this.apiUrl}/disponibilidad`, {
      params: new HttpParams()
        .set('salaId', salaId.toString())
        .set('fechaInicio', fechaInicio),
      headers: this.getAuthHeaders()
    });
  }

  obtenerFechasNoDisponibles(salaId: number): Observable<DisponibilidadSala[]> {
    return this.http.get<DisponibilidadSala[]>(`${this.apiUrl}/${salaId}/fechas-no-disponibles`, {
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

  obtenerCantidadReservasPorSala(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas`, {
      headers: this.getAuthHeaders()
    });
  }

  obtenerCantidadReservasPorSalaYEstado(): Observable<SalaEstadoCantidad[]> {
    return this.http.get<SalaEstadoCantidad[]>(`${this.apiUrl}/reservas-estado`, {
      headers: this.getAuthHeaders()
    });
  }
  solicitarSala(salaId: number, promotorId: number, nombreEvento: string, descripcion: string, fecha: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/solicitar`, null, {
      params: new HttpParams()
        .set('salaId', salaId.toString())
        .set('promotorId', promotorId.toString())
        .set('nombreEvento', nombreEvento)
        .set('descripcion', descripcion)
        .set('fecha', fecha),
      headers: this.getAuthHeaders()
    });
  }




  // Método para obtener los datos de la gráfica de reservas por estado
  getDatosGrafica(): Observable<SalaEstadoCantidad[]> {
    return this.http.get<SalaEstadoCantidad[]>('/api/salas/reservas-estado');
  }



}
