import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Evento {
  artistasAsignados: any;
  generosMusicales: any;
  nombrePromotor: string;
  estado: string;
  nombreSala: string;
  genero: string;
  ubicacion: string;
  sala_id: string;
  id: number;
  nombreEvento: string;
  descripcion: string;
  fechaEvento: string;
  imagenEvento: string;
  salaNombre: string;
  seguido?: boolean; // opcional si luego lo usas
}

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = 'http://localhost:8081'; // Cambia si tu backend es otro
  private eventoId: any;

  constructor(private http: HttpClient) {}

  // Obtener eventos confirmados
  getEventosConfirmados(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos/confirmados`);
  }

  // Obtener todos los eventos
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos/catalogo`);
  }

  // Actualizar el estado de seguimiento de un evento
  actualizarSeguimiento(id: number, seguido: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/eventos/${id}`, { seguido });
  }

  // Obtener todos los eventos (sin filtro)
  getTodosLosEventos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/eventos/todos`);
  }

  // Obtener un evento específico por ID
  getEventoPorId(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/eventos/evento/${id}`);
  }




}
