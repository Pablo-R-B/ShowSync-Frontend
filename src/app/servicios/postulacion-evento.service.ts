import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Postulacion} from '../interfaces/postulacion';
import {AuthService} from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class PostulacionEventoService {

  private apiUrl = 'http://localhost:8081';
  constructor(private http: HttpClient, private authService: AuthService) { }

  nuevaSolicitud(eventoId:number, artistaId?:number):Observable<HttpResponse<void>>{
    const rol = this.authService.userRole;

    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('X-User-Role', rol);

    const body = artistaId != null ? { artistaId } : {};
    const url = `${this.apiUrl}/postulacion/${eventoId}/solicitud`;


    return this.http.post<void>(
      url,
      body,
      {
        headers,
        observe: 'response'
      }
    );
  }

  listarPorArtista(artistaId: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/postulacion/artista/${artistaId}`);
  }

  listarPorPromotor(promotorId: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(
      `${this.apiUrl}/postulacion/promotor/${promotorId}`
    );
  }

  actualizarEstadoSolicitud(id: number, nuevoEstado: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/postulacion/${id}/estado`, { nuevoEstado });
  }

  obtenerPostulacionesPorPromotor(promotorId: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/promotor/${promotorId}`);
  }

  obtenerPostulacionesPorEvento(eventoId: number): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.apiUrl}/postulacion/evento/${eventoId}`);
  }
}
