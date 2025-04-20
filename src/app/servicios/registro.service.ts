import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UsuarioRegistroDTO } from '../interfaces/UsuarioRegistroDTO';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {

  private baseUrl = 'http://localhost:8081/auth'; // Ajusta si es otro puerto

  constructor(private http: HttpClient) {}

  registrar(usuario: UsuarioRegistroDTO): Observable<any> {
    return this.http.post(`${this.baseUrl}/registro`, usuario, { responseType: 'text' });
    // responseType 'text' porque el backend devuelve un String, no un JSON
  }
}
