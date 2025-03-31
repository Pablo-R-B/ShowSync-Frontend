import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DemoServicio {
  private apiUrl:string = `${environment.apiUrl}/hola-mundo`;
  constructor(private http: HttpClient) { }

  getMensaje(): Observable<string> {
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
}
