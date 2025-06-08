import {Component, OnInit} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EventosService} from '../../servicios/eventos.service';
import {ActivatedRoute} from '@angular/router';
import {DatePipe, NgIf} from '@angular/common';
import {EventoConfirmado} from '../../interfaces/EventoConfirmado';


@Component({
  selector: 'app-confirmar-eventos',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    NgIf
  ],
  templateUrl: './confirmar-eventos.component.html',
  styleUrl: './confirmar-eventos.component.css'
})
export class ConfirmarEventosComponent implements OnInit{
  eventoId!: number;
  promotorId!: number;
  loading = false;
  eventoConfirmado?: EventoConfirmado;

  constructor(
    private route: ActivatedRoute,
    private eventosService: EventosService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const eventoIdParam = params.get('eventoId');
      const promotorIdParam = params.get('promotorId');
      if (eventoIdParam) this.eventoId = +eventoIdParam;
      if (promotorIdParam) this.promotorId = +promotorIdParam;
    });
  }

  confirmarEvento(): void {
    this.loading = true;
    this.eventosService.confirmarEventos(this.promotorId, this.eventoId).subscribe({
      next: (respuesta) => {
        this.eventoConfirmado = respuesta;
        console.log('Evento confirmado:', this.eventoConfirmado);
        alert('¡Evento confirmado exitosamente!');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al confirmar el evento:', error);
        alert('Error al confirmar el evento. Revisa si está en estado "en_revision" o si el promotor es correcto.');
        this.loading = false;
      }
    });
  }
}

