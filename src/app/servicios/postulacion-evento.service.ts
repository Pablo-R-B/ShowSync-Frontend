import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostulacionEventoService {

  private apiUrl = 'http://localhost:8081';
  constructor(private http: HttpClient) { }

  enviarOfertaEventoArtista(eventoId:number, artistaId:number):Observable<HttpResponse<void>>{
    const params = new HttpParams()
      .set('eventoId', eventoId)
      .set('artistaId', artistaId)

    return this.http.post<void>(`${this.apiUrl}/postulacion/oferta-promotor`, null,
      {params, observe:'response'});
  }
}
