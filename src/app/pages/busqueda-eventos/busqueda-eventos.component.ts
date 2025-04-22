import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { EventosService } from '../../servicios/EventosService';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-busqueda-eventos',
  templateUrl: './busqueda-eventos.component.html',
  styleUrls: ['./busqueda-eventos.component.css'],
  standalone: true,
  imports: [
    TitleCasePipe,
    NgForOf,
    NgIf,
    NgClass
  ]
})
export class BusquedaEventosComponent implements OnInit {
  mostrarModal = false;
  eventos: any[] = [];
  generos: string[] = [];
  estados: string[] = [];

  constructor(
    private eventosService: EventosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  get usuarioLogueado(): boolean {
    return this.authService.isLoggedIn();
  }

  cargarEventos(): void {
    this.eventosService.getTodosLosEventos().subscribe(data => {
      this.eventos = data;
    });
  }

  verInfo(evento: any): void {
    if (!evento || !evento.id) {
      console.error('Evento no tiene ID');
      return;
    }

    if (!this.usuarioLogueado) {
      this.mostrarAdvertencia();
      return;
    }

    this.router.navigate([`/eventos/${evento.id}`]);
  }

  seguirEvento(evento: any): void {
    if (!this.usuarioLogueado) {
      this.mostrarModal = true;
      return;
    }

    evento.seguido = !evento.seguido;
    this.eventosService.actualizarSeguimiento(evento.id, evento.seguido).subscribe({
      next: () => {
        console.log(`Evento ${evento.seguido ? 'seguido' : 'dejado de seguir'}`);
      },
      error: (error) => {
        console.error('Error al actualizar el seguimiento:', error);
        evento.seguido = !evento.seguido; // Revertir el cambio en caso de error
      }
    });
  }

  mostrarAdvertencia(): void {
    this.mostrarModal = true;
    setTimeout(() => this.cerrarModal(), 3000); // Cierra el modal automáticamente después de 3 segundos
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formatearFecha(fecha: number[]): string {
    if (!fecha || fecha.length < 3) return '';
    const [anio, mes, dia] = fecha;
    return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
  }
}
