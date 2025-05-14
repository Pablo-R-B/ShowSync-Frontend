import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GenerosMusicalesService {
  constructor(private http: HttpClient) { }

  private apiUrl:string = `${environment.apiUrl}/genero`;
  listarGeneros(): Observable<string[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    console.log(headers);

    return this.http.get<string[]>(`${this.apiUrl}/listar-generos`, { headers });
  }
}
