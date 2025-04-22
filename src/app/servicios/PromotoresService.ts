import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventoDTO {
  id: number;
  nombreEvento: string;
  descripcion: string;
  fechaEvento: string;     // vendrá formateado como ISO desde el backend
  estado: string;
  imagenEvento: string;
  idSala: number;
  nombreSala: string;
  idPromotor: number;
  nombrePromotor: string;
}

export interface Promotor {
  id: number;
  nombrePromotor: string;
  descripcion: string;
  imagenPerfil: string;
}

@Injectable({ providedIn: 'root' })
export class PromotoresService {
  private apiUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  /** GET  /promotores/{id} */
  cargarPromotorPorId(id: number): Observable<Promotor> {
    return this.http.get<Promotor>(`${this.apiUrl}/promotores/${id}`);
  }

  /** GET  /eventos/promotor/{promotorId} */
  cargarEventosDePromotor(promotorId: number): Observable<EventoDTO[]> {
    return this.http.get<EventoDTO[]>(`${this.apiUrl}/eventos/promotor/${promotorId}`);
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
}
