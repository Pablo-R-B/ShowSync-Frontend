import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Evento} from '../interfaces/Evento';
import {EventoCreacion} from '../interfaces/eventoCreacion';
import {EventoBackend} from '../interfaces/EventoBackend';
import {EventoActualizado} from '../interfaces/EventoActualizado';
import {EventoConfirmado} from '../interfaces/EventoConfirmado';


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
// Crear un nuevo evento para un promotor
  confirmarEventos(promotorId: number, eventoId: number): Observable<EventoConfirmado> {
    const url = `${this.apiUrl}/promotor/${promotorId}/eventos/${eventoId}/confirmar`;
    return this.http.put<EventoConfirmado>(url, null);
  }


  // Editar un evento de un promotor
  editarEvento(promotorId: number, eventoId: number, evento: EventoBackend): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/eventos/promotor/${promotorId}/evento/${eventoId}`, evento);
  }

  // Actualizar un evento existente
  actualizarEvento(promotorId: number, idEvento: number, eventoActualizado: EventoActualizado, imagenArchivo?: File): Observable<string> {
    const url = `${this.apiUrl}/eventos/promotor/${promotorId}/evento/${idEvento}/editar`;

    const formData = new FormData();
    formData.append('evento', JSON.stringify(eventoActualizado));
    if (imagenArchivo) {
      formData.append('imagen', imagenArchivo);
    }

    return this.http.put(url, formData, {
      observe: 'response',
      responseType: 'text'
    }).pipe(
      map((response: HttpResponse<string>) => {
        if (response.body !== null) {
          return response.body;
        } else {
          console.warn('Backend returned a successful response with a null body.');
          return '';
        }
      })
    );
  }


  // Eliminar un evento de un promotor
  eliminarEvento(promotorId: number, eventoId: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/eventos/promotor/${promotorId}/evento/${eventoId}`, { responseType: 'text' });
  }



  // Obtener un evento específico por ID
  obtenerEventoPorId(eventoId: number): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/eventos/evento/${eventoId}`);
  }


  // Obtener todos los géneros musicales disponibles
  getGeneros(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/eventos/generos`);
  }

  // Obtener todos los géneros musicales disponibles
  getGenero(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/genero/listar-generos-eventos`);
  }

  // Obtener todos los estados posibles de los eventos
  obtenerEstados(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/eventos/estados`);
  }

  // Obtener el total de eventos
  obtenerTotalEventos(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/eventos/total`);
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

  // Confirmar un evento de un Artista
  confirmarEvento(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/eventos/confirmar/${id}`, {});
  }

  // Obtener detalles de un evento para edición
  obtenerEventoDetalleParaEdicion(idEvento: number): Observable<EventoActualizado> {
    return this.http.get<EventoActualizado>(`${this.apiUrl}/eventos/detalle-edicion/${idEvento}`);
  }

  // Obtener eventos paginados
  getEventosPaginado(pagina: number, tamano: number): Observable<Evento[]> {
    return this.http.get<Evento[]>(`${this.apiUrl}/eventos/paginado?page=${pagina}&size=${tamano}`);
  }

  // Aceptar una postulación de un evento
  aceptarPostulacion(postulacionId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/eventos/${postulacionId}/aceptar`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  getEventosConfirmadosPorArtistaId(artistaId: number): Observable<EventoConfirmado[]> {
    return this.http.get<EventoConfirmado[]>(`${this.apiUrl}/eventos/artista/${artistaId}/eventos-confirmados`);
  }



}
