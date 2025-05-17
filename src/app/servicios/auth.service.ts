import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8081/auth/login';

  constructor(private http: HttpClient) {}

  login(email: string, contrasena: string): Observable<any> {
    const body = { email, contrasena };
    return this.http.post(this.apiUrl, body, {responseType:'text'} );
  }

  get userId(): number {
    const id = localStorage.getItem('userId');      // MDN: localStorage.getItem devuelve string o null :contentReference[oaicite:0]{index=0}
    return id !== null && !isNaN(+id) ? +id : 0;
  }

  get userRole(): string | null {
    const rol = localStorage.getItem('rol');
    return rol ? rol : null;
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getPerfil(): Observable<any> {
    return this.http.get('http://localhost:8081/auth/perfil');
  }


}
