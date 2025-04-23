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
    return this.http.post<{token: string}>(this.apiUrl, body);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }


}
