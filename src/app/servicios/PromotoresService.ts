import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Promotor} from '../interfaces/Promotor';
import {EventoDTO} from '../interfaces/EventoDTO';




@Injectable({ providedIn: 'root' })
export class PromotoresService {
  private apiUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}



  /** GET  /promotores/{id} */
  cargarPromotorPorId(id: number | null): Observable<Promotor> {
    return this.http.get<Promotor>(`${this.apiUrl}/promotores/${id}`);
  }

  /** GET  /eventos/promotor/{promotorId} */
  cargarEventosDePromotor(promotorId: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/promotor/${promotorId}`);
  }

  listarEventosPorUsuarioDePromotor(usuarioIdPromotor:number): Observable<EventoDTO[]>{
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/promotor/usuarioPromotor/${usuarioIdPromotor}`);
  }

  /** GET  /eventos/catalogo */
  cargarCatalogoEventos(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/catalogo`);
  }

  /** GET  /eventos/confirmados */
  cargarEventosConfirmados(): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/confirmados`);
  }

  // Si en tu backend no existe un endpoint de artistas, aquí tendrías que crearlo
  /** (Pendiente: crear endpoint GET /promotores/{id}/artistas en backend) */
  cargarArtistasDePromotor(promotorId: number): Observable<{ nombre: string }[]> {
    return this.http.get<{ nombre: string }[]>(`${this.apiUrl}/promotores/${promotorId}/artistas`);
  }

  // Método para obtener todos los promotores
  obtenerPromotoras(): Observable<Promotor[]> {
    return this.http.get<Promotor[]>(`${this.apiUrl}/promotores`);
  }

  // Método para crear un nuevo promotor
  crearPromotor(promotor: Promotor): Observable<Promotor> {
    return this.http.post<Promotor>(`${this.apiUrl}/promotores/crear`, promotor);
  }

  // Método para editar un promotor
  editarPromotor(id: number, promotor: Promotor): Observable<Promotor> {
    return this.http.put<Promotor>(`${this.apiUrl}/promotores/editar/${id}`, promotor);
  }

  // Método para eliminar un promotor
  eliminarPromotor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/promotores/eliminar/${id}`);
  }

  getPerfilUsuario(): Observable<Promotor> {
    return this.http.get<Promotor>(`${this.apiUrl}/auth/perfil`);
  }

  // Obtener promotor por ID de usuario
  getPromotorPorIdUsuario(idUsuario: number): Observable<Promotor> {
    return this.http.get<Promotor>(`${this.apiUrl}/promotores/usuario/${idUsuario}`);
  }
}
