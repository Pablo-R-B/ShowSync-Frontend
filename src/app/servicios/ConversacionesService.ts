import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {MensajeChat} from '../interfaces/MensajeChat';

@Injectable({
  providedIn: 'root'
})

export class ConversacionesService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = `${environment.apiUrl}/conversaciones`;

  /**
   * Obtiene o crea un ID de conversación (chatId) entre un artista y un promotor.
   * @param artistaId El ID del artista.
   * @param promotorId El ID del promotor.
   * @returns Un Observable que emite el chatId.
   */
  getOrCreateConversation(artistaId: number, promotorId: number): Observable<number> {
    const url = `${this.apiUrl}/${artistaId}/${promotorId}`;
    return this.http.get<number>(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene el historial de mensajes para una conversación específica.
   * @param chatId El ID de la conversación.
   * @returns Un Observable que emite una lista de MensajeChat.
   */
  getConversationMessages(chatId: number): Observable<MensajeChat[]> { // Actualizado el tipo de retorno a MensajeChat[]
    const url = `${this.apiUrl}/${chatId}/mensajes`;
    return this.http.get<MensajeChat[]>(url).pipe( // Actualizado el tipo en el método get
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Error en el servicio de conversaciones:', error);
    let errorMessage = 'Ha ocurrido un error desconocido en el servicio de conversaciones';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del lado del cliente: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Error del lado del servidor - Código: ${error.status}, Mensaje: ${error.message || error.error}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
