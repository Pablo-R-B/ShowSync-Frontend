import { Injectable } from '@angular/core';
import { RespuestaPaginada } from '../interfaces/respuesta-paginada';
import { Artistas } from '../interfaces/artistas';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import {GeneroMusical} from '../interfaces/GeneroMusical';
import {EventoConfirmado} from '../interfaces/EventoConfirmado';

@Injectable({
  providedIn: 'root'
})
export class ArtistasService {

  constructor(private http: HttpClient) { }

  private apiUrl: string = `${environment.apiUrl}/artistas`;

  listarArtistasConGeneros(
    page: number,
    size: number,
    termino?: string
  ): Observable<RespuestaPaginada<Artistas>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('termino', termino || '');

    return this.http.get<RespuestaPaginada<Artistas>>(
      `${this.apiUrl}/listar-artistas`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  artistasPorGenero(
    genero: string,
    page: number,
    size: number,
    termino?: string
  ): Observable<RespuestaPaginada<Artistas>> {
    // Codificar el género para manejar espacios y caracteres especiales
    const generoEncoded = encodeURIComponent(genero);

    const params = new HttpParams()
      .set('genero', generoEncoded)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('termino', termino || '');

    console.log('URL completa:', `${this.apiUrl}/artistas-por-genero?${params.toString()}`);
    console.log('Género original:', genero, 'Género codificado:', generoEncoded);

    return this.http.get<RespuestaPaginada<Artistas>>(
      `${this.apiUrl}/artistas-por-genero`,
      { params }
    ).pipe(
      catchError(this.handleError)
    );
  }

  artistaPorId(id: number): Observable<Artistas> {
    return this.http.get<Artistas>(`${this.apiUrl}/artista/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getArtistaIdPorUsuario(usuarioId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/por-usuario/${usuarioId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  artistasPorPromotor(promotorId: number): Observable<Artistas[]> {
    return this.http.get<Artistas[]>(`${this.apiUrl}/promotor/${promotorId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getDatosArtistaPorUsuarioId(usuarioId: number): Observable<Artistas> {
    return this.http.get<Artistas>(`${this.apiUrl}/miperfil?usuarioId=${usuarioId}`)
      .pipe(catchError(this.handleError));
  }


  obtenerImagenesDeTodosLosArtistas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/imagenes`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getArtistaConNumeroEventos(id: number): Observable<Artistas> {
    return this.http.get<Artistas>(`${this.apiUrl}/artista/${id}/total-eventos`);
  }



  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 404:
          errorMessage = 'Recurso no encontrado. Verifique que el endpoint exista en el backend.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor.';
          break;
        case 0:
          errorMessage = 'No se puede conectar con el servidor. Verifique que esté ejecutándose.';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }

    console.error('Error completo:', error);
    return throwError(() => new Error(errorMessage));
  }

  guardarPerfilArtista(usuarioId: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/artista/usuario/${usuarioId}`, data);
  }

  getGenerosDelArtista(id: number): Observable<GeneroMusical[]> {
    return this.http.get<GeneroMusical[]>(`${this.apiUrl}/artista/${id}/generos`);
  }

  getArtistas(): Observable<Artistas[]> {
    return this.http.get<Artistas[]>(`${this.apiUrl}/todos`)
      .pipe(
        catchError(this.handleError)
      );
  }


}
