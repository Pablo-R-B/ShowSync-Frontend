import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-restablecer',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './restablecer.component.html',
  styleUrls: ['./restablecer.component.css']
})
export class RestablecerComponent {
  token: string = '';
  nuevaContrasena: string = '';
  mensaje: string = '';
  error: string = '';
  contrasenaEnviada: boolean = false; // Nueva propiedad para controlar el estado
  enviando: boolean = false; // Para mostrar estado de carga

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    protected router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  onRestablecer() {
    // Verificar si ya se envió la contraseña
    if (this.contrasenaEnviada) {
      return;
    }

    // Validación básica
    if (!this.nuevaContrasena.trim()) {
      this.error = 'La contraseña no puede estar vacía';
      return;
    }

    this.enviando = true;
    this.error = '';
    this.mensaje = '';

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
        this.contrasenaEnviada = true; // Marcar como enviada
        this.enviando = false;

        // Opcional: Redirigir automáticamente después de unos segundos
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.error = err.error;
        this.mensaje = '';
        this.enviando = false;
        // No marcar como enviada si hay error
      }
    });
  }
}
