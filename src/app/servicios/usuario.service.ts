import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { Usuario } from '../interfaces/usuario';


@Injectable({ providedIn: 'root' })
export class UsuarioService {

  private apiUrl = 'http://localhost:8081/usuarios';

  constructor(private http: HttpClient) {}

  obtenerTodosLosUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}`);
  }

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

  obtenerUsuariosPorRol(rol: string): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/rol/${rol}`);
  }

}
