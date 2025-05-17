import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import {Promotor} from '../../interfaces/Promotor';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {PromotoresService} from '../../servicios/PromotoresService';

@Component({
  selector: 'app-promotores',
  standalone: true,
  imports: [
    CommonModule,
    NgForOf,
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

  idPromotor!: number;

  constructor(
    private promotoresService: PromotoresService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // ✅ Obtenemos el ID desde la URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idPromotor = parseInt(idParam, 10);
      this.obtenerPromotor();
      this.obtenerEventos();
      this.obtenerArtistas();
    } else {
      console.error('No se encontró ID de promotor en la ruta');
    }
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
          this.eventoDestacado = data[0];
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
