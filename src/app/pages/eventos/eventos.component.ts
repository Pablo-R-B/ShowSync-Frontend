import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {DatePipe,NgIf} from '@angular/common';
import {EventosService} from '../../servicios/EventosService';


@Component({
  selector: 'app-eventos',
  standalone: true,  // Marca el componente como standalone
  templateUrl: './eventos.component.html',
  imports: [
    DatePipe,
    NgIf,
  ],
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  evento: any;

  constructor(
    private eventosService: EventosService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el ID de la URL
    const eventoId = this.route.snapshot.paramMap.get('id');

    if (eventoId) {
      this.cargarEvento(eventoId);
    } else {
      console.error('ID del evento no encontrado');
    }
  }

  cargarEvento(eventoId: string): void {
    // Llamada al servicio para obtener los detalles del evento por ID
    this.eventosService.getEventoPorId(eventoId).subscribe(
      (data) => {
        this.evento = data;
      },
      (error) => {
        console.error('Error al cargar el evento', error);
      }
    );
  }
}
