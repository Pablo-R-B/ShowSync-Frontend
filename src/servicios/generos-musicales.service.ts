import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GenerosMusicalesService {

  constructor(private http: HttpClient) { }

  private apiUrl:string = `${environment.apiUrl}/genero`;

  listarGeneros(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/listar-generos`);
  }
}
