import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import {timeout} from 'rxjs';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  templateUrl: './recuperar.component.html',
  imports: [FormsModule, NgIf, RouterLink],
  styleUrls: ['./recuperar.component.css']
})
export class RecuperarComponent {
  email: string = '';
  mensaje: string = '';
  error: string = '';
  loading: boolean = false;


  constructor(private http: HttpClient) {}

  onRecuperar() {
    this.loading = true;
    const params = new HttpParams().set('email', this.email);
    this.http.post('http://localhost:8081/auth/password-recovery/request', null, { params, responseType: 'text' })
      .subscribe({
        next: (mensaje: string) => {
          this.mensaje = mensaje;
          this.error = '';
          this.loading = false;
        },
        error: (err: { error: string }) => {
          this.error = err.error;
          this.mensaje = '';
          this.loading = false;
        }
      });
  }
}
