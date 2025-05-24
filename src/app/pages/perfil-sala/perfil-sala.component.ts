import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalasService } from '../../servicios/salas.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgIf, NgFor } from '@angular/common';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { EventoCreacion } from '../../interfaces/eventoCreacion';
import {EventosService} from '../../servicios/eventos.service';


@Component({
  selector: 'app-perfil-sala',
  standalone: true,
  imports: [FullCalendarModule, NgIf, NgFor, FormsModule],
  templateUrl: './perfil-sala.component.html',
  styleUrls: ['./perfil-sala.component.css']
})
export class PerfilSalaComponent implements OnInit {
  fechaSeleccionada: string | null = null;
  mostrarFormularioEvento = false;
  idPromotor: number = 0;
  sala: any;
  generosDisponibles: string[] = [];
  generosSeleccionados: string[] = [];

  nuevoEvento = {
    nombre: '',
    descripcion: ''
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    dateClick: this.onDateClick.bind(this) // correctamente dentro de calendarOptions
  };

  constructor(
    private route: ActivatedRoute,
    private salaService: SalasService,
    private eventosService: EventosService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.idPromotor = this.authService.userId;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.salaService.obtenerPorId(Number(id)).subscribe(sala => {
        this.sala = sala;
        this.cargarDisponibilidad(Number(id));
      });

      this.eventosService.getGeneros().subscribe({
        next: generos => this.generosDisponibles = generos,
        error: err => console.error('Error al cargar géneros musicales', err)
      });
    }
  }

  private getRandomGreenTone(): string {
    const greenTones = ['#a8e6cf', '#dcedc1', '#b2f2bb', '#c3f9d4', '#d0f4de'];
    return greenTones[Math.floor(Math.random() * greenTones.length)];
  }

  cargarDisponibilidad(salaId: number) {
    const hoy = new Date();
    const fin = new Date();
    fin.setDate(hoy.getDate() + 30);
    const inicioStr = hoy.toISOString().split('T')[0];
    const fechaInicio = new Date().toISOString().split('T')[0]; // Formato: 'YYYY-MM-DD'

    const finStr = fin.toISOString().split('T')[0];

    this.salaService.consultarDisponibilidad(salaId, fechaInicio, finStr).subscribe(disponibilidad => {
      const eventos = disponibilidad.map((d: any) => ({
        title: d.disponibilidad ? 'Disponible' : 'No disponible',
        date: d.fecha,
        color: d.disponibilidad ? this.getRandomGreenTone() : 'red',
        editable: false
      }));

      this.calendarOptions = {
        ...this.calendarOptions,
        events: eventos
      };
    });
  }

  onDateClick(arg: any) {
    const fecha = arg.dateStr;
    const eventoExistente = (this.calendarOptions.events as any[]).find(e => e.date === fecha && e.color === 'red');

    if (!eventoExistente) {
      this.fechaSeleccionada = fecha;
      this.mostrarFormularioEvento = true;
    } else {
      alert('Este día ya está ocupado o restringido.');
    }
  }

  enviarEvento() {
    if (!this.fechaSeleccionada || !this.sala || this.idPromotor === 0) {
      alert('Falta información necesaria para crear el evento');
      return;
    }

    const eventoRequest: EventoCreacion = {
      nombreEvento: this.nuevoEvento.nombre,
      descripcion: this.nuevoEvento.descripcion,
      fechaEvento: this.fechaSeleccionada,
      idSala: this.sala.id,
      generosMusicales: this.generosSeleccionados,
      imagenEvento: ''
    };

    this.eventosService.crearEventoEnRevision(eventoRequest).subscribe(
      () => {
        const nuevoEvento = {
          title: `${this.nuevoEvento.nombre} (En revisión)`,
          date: this.fechaSeleccionada,
          color: 'orange',
        };

        this.calendarOptions = {
          ...this.calendarOptions,
          events: [...(this.calendarOptions.events as any[]), nuevoEvento]
        };

        alert('Evento enviado para revisión correctamente');
        this.cancelarEvento();
        },
      (error) => {
        console.error('Error al crear evento:', error);
        alert(error.error?.message || 'Error al crear el evento');
      }
    );
  }

  cancelarEvento() {
    this.mostrarFormularioEvento = false;
    this.fechaSeleccionada = null;
    this.nuevoEvento = { nombre: '', descripcion: '' };
    this.generosSeleccionados = [];
  }
}
