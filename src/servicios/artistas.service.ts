import { Injectable } from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArtistasService {

  constructor(private http: HttpClient) { }

  private apiUrl:string = `${environment.apiUrl}/artistas`;
  // private apiUrl:string = "http://localhost:8080/artistas/listar-artistas";

  listarArtistasConGeneros(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listar-artistas`).pipe(
      catchError(error => {
        console.error('URL solicitada:', `${this.apiUrl}/listar-artistas`);
        console.error('Error en listarArtistasConGeneros:', error);
        return throwError(() => new Error('Error en la petición de artistas'));
      })
    );

  }

  private erroresArtistas(erros:HttpErrorResponse): Observable<never> {
    return throwError(() => new Error('Error al obtener el catálogo de artistas. Inténtelo más tarde'));
  }
}
