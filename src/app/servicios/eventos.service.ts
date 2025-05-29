import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Evento} from '../interfaces/Evento';
import {EventoCreacion} from '../interfaces/eventoCreacion';
import {EventoBackendDTO} from '../interfaces/EventoBackendDTO';


@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private apiUrl = 'http://localhost:8081'; // Cambia si tu backend es otro
  private eventoId: any;

  constructor(private http: HttpClient) {}

  private obtenerToken(): string {
    return localStorage.getItem('token') || '';
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', 'Bearer ' + this.obtenerToken());
  }

  // Obtener eventos confirmados
  getEventosConfirmados(): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos/confirmados`);
  }

  // Obtener todos los eventos
  getEventos(eventosId: any): Observable<Evento[]> {
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

  // Crear un nuevo evento para un promotor
  crearEvento(promotorId: number, evento: Evento): Observable<Evento> {
    return this.http.post<Evento>(`${this.apiUrl}/eventos/promotor/${promotorId}`, evento);
  }

  getEventoPorPromotor(idPromotor: number, idEvento: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/eventos/promotor/${idPromotor}/evento/${idEvento}`);
  }

  // Editar un evento de un promotor
  editarEvento(promotorId: number, eventoId: number, evento: EventoBackendDTO): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/eventos/promotor/${promotorId}/evento/${eventoId}`, evento);
  }


  // Eliminar un evento de un promotor
  eliminarEvento(promotorId: number, eventoId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/eventos/promotor/${promotorId}/evento/${eventoId}`, { responseType: 'text' });
  }



  // Obtener un evento específico por ID
  obtenerEventoPorId(eventoId: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/evento/evento/${eventoId}`);
  }


  // Obtener todos los géneros musicales disponibles
  getGeneros(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/eventos/generos`);
  }

  // Obtener todos los géneros musicales disponibles
  getGenero(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/genero/listar-generos`);
  }
  // Obtener todos los estados posibles de los eventos
  obtenerEstados(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/eventos/estados`);
  }



// Obtener eventos de un promotor específico
  obtenerEventosDePromotor(promotorId: number): Observable<Evento[]> {
  return this.http.get<Evento[]>(`${this.apiUrl}/eventos/promotor/${promotorId}`);
}

  crearEventoEnRevision(evento: FormData): Observable<any> {
    const token = localStorage.getItem('token'); // o donde lo guardes
    return this.http.post(`${this.apiUrl}/eventos/reserva/sala`, evento, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }


  cancelarEvento(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/eventos/cancelar/${id}`, {});
  }

  confirmarEvento(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/eventos/confirmar/${id}`, {});
  }

  getEventosPaginado(pagina: number, tamaño: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos/paginado?page=${pagina}&size=${tamaño}`);
  }


}
