import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

    if (typeof params.termino === 'string' && params.termino.trim()) {
      httpParams = httpParams.set('termino', params.termino.trim());
    }

    if (typeof params.sortField === 'string') {
      httpParams = httpParams.set('sortField', params.sortField);
    }

    if (typeof params.sortDirection === 'string') {
      httpParams = httpParams.set('direction', params.sortDirection);
    }

    if (typeof params.rol === 'string' && params.rol.trim()) {
      httpParams = httpParams.set('rol', params.rol.trim());
    }

    return this.http.get<RespuestaPaginada<Usuario>>(this.apiUrl, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
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

  // Métodos adicionales
  obtenerUsuarioPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}`, usuario);
  }

  actualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


}
