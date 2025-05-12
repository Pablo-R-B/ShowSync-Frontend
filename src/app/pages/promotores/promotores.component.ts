import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { EventoDTO, Promotor, PromotoresService } from '../../servicios/PromotoresService';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-promotores',
  standalone: true,
  imports: [
    CommonModule,
    NgForOf,
    RouterLink
  ],
  providers: [DatePipe],
  templateUrl: './promotores.component.html',
  styleUrls: ['./promotores.component.css']
})
export class PromotoresComponent implements OnInit {
  promotor: Promotor | null = null;
  logoUrl: string = 'assets/logo.png';

  eventos: EventoDTO[] = [];
  eventoDestacado?: EventoDTO;
  eventosProximos: Array<{ fecha: string; lugar: string; nombre: string }> = [];
  artistas: Array<{ nombre: string }> = [];

  private idPromotor = 0; // Aquí debes cambiarlo dinámicamente si lo deseas.

  constructor(
    private promotoresService: PromotoresService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // this.obtenerPromotor();
    this.route.params.subscribe(params => {
      this.idPromotor = +params['id'];
      this.obtenerPromotor();
    })
    this.obtenerEventos();
    this.obtenerArtistas();
  }

  // Obtener los detalles del promotor
  private obtenerPromotor() {
    this.promotoresService.cargarPromotorPorId(this.idPromotor)
      .subscribe(data => {
        this.promotor = data;
        this.logoUrl = data.imagenPerfil;
      });
  }

  // Obtener los eventos del promotor y clasificarlos
  private obtenerEventos() {
    const hoy = new Date();

    this.promotoresService.cargarEventosDePromotor(this.idPromotor)
      .subscribe(data => {
        this.eventos = data;

        if (data.length) {
          // Establecer el evento destacado
          this.eventoDestacado = data[1];
        }

        // Filtrar los eventos futuros
        this.eventosProximos = data
          .filter(e => new Date(e.fechaEvento) > hoy)
          .map(e => ({
            fecha: this.datePipe.transform(e.fechaEvento, 'dd/MM/yyyy')!,
            lugar: e.nombreSala,
            nombre: e.nombreEvento
          }));
      });
  }

  // Obtener los artistas asociados al promotor
  private obtenerArtistas() {
    this.promotoresService.cargarArtistasDePromotor(this.idPromotor)
      .subscribe(data => this.artistas = data);
  }

  // Método para ver los detalles de un evento
  verDetallesEvento(eventoId: number) {
    if (!eventoId) {
      console.error('ID del evento no es válido');
      return;
    }

    // Navegar a los detalles del evento
    this.router.navigate([`/eventos/${eventoId}`]);
  }

  // Método para navegar a todos los eventos de un promotor
  verEventosDePromotor(promotorId: number) {
    if (!promotorId) {
      console.error('ID del promotor no válido');
      return;
    }

    // Navegar a la lista de eventos del promotor
    this.router.navigate([`/eventos/promotor/${promotorId}`]);

  }
}
