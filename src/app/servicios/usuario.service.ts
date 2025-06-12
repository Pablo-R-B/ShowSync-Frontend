import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import { Usuario } from '../interfaces/usuario';
import { PaginationParams } from '../interfaces/PaginationParams';
import {RespuestaPaginada} from '../interfaces/respuesta-paginada';

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private apiUrl = 'http://localhost:8081/usuarios';

  constructor(private http: HttpClient) {}

  // Método actualizado con paginación, orden y filtros
  obtenerTodasPaginadas(params: PaginationParams = {}): Observable<RespuestaPaginada<Usuario>> {
    let httpParams = new HttpParams()
      .set('page', (params.page ?? 0).toString())
      .set('size', (params.size ?? 10).toString());

    if (params.termino) {
      httpParams = httpParams.set('termino', params.termino);
    }

    if (params.sortField) {
      httpParams = httpParams.set('sortField', params.sortField);
    }

    if (params.sortDirection) {
      httpParams = httpParams.set('direction', params.sortDirection);
    }

    if (params.rol) {
      httpParams = httpParams.set('rol', params.rol);
    }


    return this.http.get<RespuestaPaginada<Usuario>>(this.apiUrl, {
      params: httpParams,
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => console.log('Respuesta recibida:', response)) // Para depuración
    );
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


  // Método para obtener el numero total de usuarios totales y por rol
  contarUsuariosPorRol(): Observable<Map<string, number>> {
    const url = `${this.apiUrl}/contar-usuarios-por-rol`;
    return this.http.get<Map<string, number>>(url, {
      headers: this.getAuthHeaders()
    });
  }




}
