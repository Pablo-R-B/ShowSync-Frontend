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

  get userRole(): string {
    const role = localStorage.getItem('rol');
    return role !== null ? role : '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getPerfil(): Observable<any> {
    return this.http.get('http://localhost:8081/auth/perfil');
  }

  getToken(): string | null {
    return localStorage.getItem('token'); //
  }


  getPerfilCompletoFromToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.perfilCompleto === true;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }


}
