import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EventosService } from '../../servicios/EventosService';
import { SalasService } from '../../servicios/salas.service';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-perfil-promotores',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    NgIf,
    DatePipe,
    NgClass
  ],
  templateUrl: './perfil-promotores.component.html',
  styleUrls: ['./perfil-promotores.component.css']
})
export class PerfilPromotoresComponent implements OnInit {

  promotor: any;
  eventos: any[] = [];
  salas: any[] = [];

  logoUrl = 'assets/default-promotor.png';
  defaultSalaLogo = 'assets/default-sala.png';

  constructor(
    private router: Router,
    private eventosService: EventosService,
    private salasService: SalasService
  ) {}

  ngOnInit(): void {
    this.promotor = JSON.parse(localStorage.getItem('promotor') || '{}');
    this.cargarEventos();
    this.cargarSalas();
  }

  cargarEventos(): void {
    this.eventosService.obtenerEventosDePromotor(this.promotor.id)
      .subscribe({
        next: (data: any[]) => this.eventos = data,
        error: (err: any) => console.error('Error al cargar eventos', err)
      });
  }

  abrirFormularioCrearEvento(): void {
    this.router.navigate(['/eventos/crear']);
  }

  editarEvento(evento: any): void {
    this.router.navigate(['/eventos/editar', evento.id]);
  }

  eliminarEvento(eventoId: number): void {
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      this.eventosService.eliminarEvento(this.promotor.id, eventoId)
        .subscribe({
          next: () => this.cargarEventos(),
          error: (err) => console.error('Error al eliminar evento', err)
        });
    }
  }

  cargarSalas(): void {
    this.salasService.obtenerSalas(this.promotor.id)
      .subscribe({
        next: (data) => this.salas = data,
        error: (err) => console.error('Error al cargar salas', err)
      });
  }



  confirmarSala(salaId: number): void {
    this.salasService.confirmarSala(salaId)
      .subscribe({
        next: () => alert('Sala confirmada correctamente'),
        error: (err) => console.error('Error al confirmar sala', err)
      });
  }

  crearSala(): void {
    this.router.navigate(['/salas/crear']);
  }
}
