import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactoFormComponent } from './contacto-form/contacto-form.component';

@Component({
  selector: 'app-instrucciones-uso',
  standalone: true,
  imports: [
    CommonModule,
    ContactoFormComponent
  ],
  template: `
    <section class="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 class="text-3xl font-bold mb-4 text-center">¿Cómo funciona?</h1>
      <p class="text-lg mb-8 text-center text-gray-600">
        Nuestra plataforma conecta artistas con promotores a través de eventos musicales únicos.
        Aquí te explicamos cómo usarla según tu rol.
      </p>

      <div class="grid md:grid-cols-2 gap-8">
        <!-- Artistas -->
        <div class="bg-white shadow-lg rounded-2xl p-6 border">
          <h2 class="text-xl font-semibold mb-4">🎤 Soy Artista</h2>
          <ul class="space-y-3 list-disc list-inside text-gray-700">
            <li>Explora los eventos disponibles en el catálogo.</li>
            <li>Postúlate a los eventos que encajen con tu estilo y disponibilidad.</li>
            <li>Recibe notificaciones si eres seleccionado por un promotor.</li>
            <li>Prepara tu mejor show y haz crecer tu carrera.</li>
          </ul>
        </div>

        <!-- Promotores -->
        <div class="bg-white shadow-lg rounded-2xl p-6 border">
          <h2 class="text-xl font-semibold mb-4">🎟️ Soy Promotor</h2>
          <ul class="space-y-3 list-disc list-inside text-gray-700">
            <li>Consulta las salas disponibles y crea tu evento fácilmente.</li>
            <li>Publica el evento aunque aún no tengas artistas asignados.</li>
            <li>Recibe postulaciones o busca artistas directamente.</li>
            <li>Asigna a los artistas ideales y confirma tu evento.</li>
          </ul>
        </div>
      </div>

      <!-- Formulario de contacto -->
      <div class="mt-16">
        <app-contacto-form></app-contacto-form>
      </div>
    </section>
  `,
  styleUrls: ['./intrucciones-uso.component.css']
})
export class InstruccionesUsoComponent {}
