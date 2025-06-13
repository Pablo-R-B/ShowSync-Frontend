import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/auth/login';
  private userDataSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.initializeUserData();
  }

  // Método para inicializar los datos del usuario
  private initializeUserData() {
    const userData = {
      userId: this.userId,
      userRole: this.userRole,
      username: localStorage.getItem('username') || '',
      perfilCompleto: this.getPerfilCompletoFromToken()
    };
    this.userDataSubject.next(userData);
  }

  // Observable para los datos del usuario
  get userData$(): Observable<any> {
    return this.userDataSubject.asObservable();
  }

  login(email: string, contrasena: string): Observable<any> {
    const body = { email, contrasena };
    return this.http.post(this.apiUrl, body, {responseType:'text'}).pipe(
      tap(() => {
        this.initializeUserData(); // Actualizar datos después del login
      })
    );
  }

  get userId(): number {
    const id = localStorage.getItem('userId');
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
    return localStorage.getItem('token');
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

  updateProfile(profileData: any): Observable<any> {
    const url = `http://localhost:8081/auth/account/update`;
    return this.http.put(url, profileData).pipe(
      tap(response => {
        // Actualizar localStorage si se cambió el nombre de usuario
        if (profileData.nuevoNombreUsuario) {
          localStorage.setItem('username', profileData.nuevoNombreUsuario);
        }

        // Actualizar el subject con los nuevos datos
        this.initializeUserData();
      })
    );
  }
}
