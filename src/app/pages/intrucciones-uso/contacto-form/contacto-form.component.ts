import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-100 rounded-2xl p-6 shadow-inner">
      <h3 class="text-2xl font-semibold mb-4 text-center">📩 Envíanos tus dudas</h3>
      <form
        (ngSubmit)="enviarMensaje()"
        #formulario="ngForm"
        class="grid gap-4 max-w-xl mx-auto"
      >
        <input
          type="text"
          name="nombre"
          [(ngModel)]="form.nombre"
          required
          placeholder="Tu nombre"
          class="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring w-full"
        />
        <input
          type="email"
          name="email"
          [(ngModel)]="form.email"
          required
          placeholder="Tu correo electrónico"
          class="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring w-full"
        />
        <textarea
          name="mensaje"
          [(ngModel)]="form.mensaje"
          required
          rows="5"
          placeholder="Escribe tu mensaje..."
          class="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring w-full"
        ></textarea>

        <button
          type="submit"
          [disabled]="formulario.invalid || cargando"
          class="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {{ cargando ? 'Enviando...' : 'Enviar mensaje' }}
        </button>

        <div *ngIf="enviado" class="p-4 mb-4 text-green-700 bg-green-100 rounded-lg">
          <p *ngIf="mensajeExito" class="text-sm">{{ mensajeExito }}</p>
        </div>

        <div *ngIf="error" class="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p>Ocurrió un error al enviar el mensaje. Intenta más tarde.</p>
          <p *ngIf="mensajeError" class="text-sm">{{ mensajeError }}</p>
        </div>
      </form>
    </div>
  `,
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
