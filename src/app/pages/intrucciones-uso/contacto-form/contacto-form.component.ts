import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto-form.component.html',
  styleUrls: ['./contacto-form.component.css']
})
export class ContactoFormComponent {
  form = {
    nombre: '',
    email: '',
    mensaje: ''
  };

  cargando = false;
  enviado = false;
  error = false;
  mensajeExito: any;
  mensajeError: string | undefined;

  constructor(private http: HttpClient) {}

  enviarMensaje() {
    this.cargando = true;
    this.enviado = false;
    this.error = false;

    // Validación del formato del email
    const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.form.email)) {
      this.cargando = false;
      this.error = true;
      this.mensajeError = 'El email proporcionado no es válido.';
      return;
    }

    this.http.post<{success: boolean, message?: string}>('http://localhost:8081/api/contacto', this.form)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.enviado = true;
            this.error = false;
            this.mensajeExito = response.message;
            this.form = { nombre: '', email: '', mensaje: '' };
          } else {
            this.error = true;
            this.enviado = false;
            this.mensajeError = response.message;
          }
          this.cargando = false;
        },

        error: (err) => {
          console.error('Error:', err);
          this.error = true;
          this.enviado = false;
          this.cargando = false;
          this.mensajeError = err.error?.message || 'Ocurrió un error inesperado.';
        }
      });
  }
}
