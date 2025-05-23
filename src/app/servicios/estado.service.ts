import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Estado} from '../interfaces/Estado';

@Injectable({ providedIn: 'root' })
export class EstadoService {
  private apiUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  getEstados(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/estado`);
  }
}

