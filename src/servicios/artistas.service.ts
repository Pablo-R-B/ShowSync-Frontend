import { Injectable } from '@angular/core';
import {environment} from '../environments/environment';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import {Artistas} from '../interfaces/artistas';
import {RespuestaPaginada} from '../interfaces/respuesta-paginada';

@Injectable({
  providedIn: 'root'
})
export class ArtistasService {

  constructor(private http: HttpClient) { }

  private apiUrl:string = `${environment.apiUrl}/artistas`;
  // private apiUrl:string = "http://localhost:8080/artistas/listar-artistas";


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
    );
  }


  artistasPorGenero(
    genero: string,
    page: number,
    size: number,
    termino?: string
  ): Observable<RespuestaPaginada<Artistas>> {
    const params = new HttpParams()
      .set('genero', genero)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('termino', termino || '');

    return this.http.get<RespuestaPaginada<Artistas>>(
      `${this.apiUrl}/artistas-por-genero`,
      { params }
    );
  }
  // buscarPorNombre(termino: string): Observable<Artistas[]> {
  //   return this.http.get<Artistas[]>(`${this.apiUrl}/buscar`, {params:{termino}});
  // }

  private erroresArtistas(erros:HttpErrorResponse): Observable<never> {
    return throwError(() => new Error('Error al obtener el catálogo de artistas. Inténtelo más tarde'));
  }

}
