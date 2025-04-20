import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-restablecer',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './restablecer.component.html',
  styleUrls: ['./restablecer.component.css']
})
export class RestablecerComponent {
  token: string = '';
  nuevaContrasena: string = '';
  mensaje: string = '';
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  onRestablecer() {
    const params = new HttpParams()
      .set('token', this.token)
      .set('nuevaContrasena', this.nuevaContrasena);

    this.http.post('http://localhost:8081/auth/password-recovery/reset', {}, {
      params,
      responseType: 'text'
    }).subscribe({
      next: (mensaje) => {
        this.mensaje = mensaje;
        this.error = '';

      },
      error: (err) => {
        this.error = err.error;
        this.mensaje = '';
      }
    });
  }

  irAlLogin() {
    this.router.navigate(['/auth/login']);
  }

}
