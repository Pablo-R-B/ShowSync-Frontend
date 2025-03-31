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

  listarArtistasConGeneros(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/listar-artistas`).pipe(
      catchError(this.erroresArtistas)
    );

  }

  private erroresArtistas(erros:HttpErrorResponse): Observable<never> {
    return throwError(() => new Error('Error al obtener el catálogo de artistas. Inténtelo más tarde'));
  }
}
