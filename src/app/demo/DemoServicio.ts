import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DemoServicio {
  private apiUrl = 'http://localhost:8080/api/hola-mundo';
  constructor(private http: HttpClient) { }

  getMensaje(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}
