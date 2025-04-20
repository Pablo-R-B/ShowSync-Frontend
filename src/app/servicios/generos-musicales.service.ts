import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';

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
