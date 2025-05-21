import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalasService } from '../../servicios/salas.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgIf } from '@angular/common';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions } from '@fullcalendar/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-perfil-sala',
  standalone: true,
  imports: [
    FullCalendarModule,
    NgIf,
    FormsModule
  ],
  templateUrl: './perfil-sala.component.html'
})
export class PerfilSalaComponent implements OnInit {
  fechaSeleccionada: string | null = null;
  mostrarFormularioEvento = false;

  sala: any;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    dateClick: this.onDateClick.bind(this)
  };


  constructor(
    private route: ActivatedRoute,
    private salaService: SalasService
  ) {}

  onDateClick(arg: any) {
    const fecha = arg.dateStr;

    // Verificar si el día está disponible
    const eventoExistente = (this.calendarOptions.events as any[]).find(e => e.date === fecha && e.color === 'red');

    if (!eventoExistente) {
      this.fechaSeleccionada = fecha;
      this.mostrarFormularioEvento = true;
    }
  }


  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.salaService.obtenerPorId(Number(id)).subscribe(sala => this.sala = sala);

      const hoy = new Date();
      const fin = new Date();
      fin.setDate(hoy.getDate() + 30);
      const inicioStr = hoy.toISOString().split('T')[0];
      const finStr = fin.toISOString().split('T')[0];

      this.salaService.consultarDisponibilidad(Number(id), inicioStr, finStr).subscribe(disponibilidad => {
        const eventos = disponibilidad.map((d: any) => ({
          title: d.disponibilidad ? 'Disponible' : 'No disponible',
          date: d.fecha,
          color: d.disponibilidad ? 'green' : 'red',
          editable: false
        }));

        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos
        };
      });
    }
  }

  handleDateClick(arg: any) {
    const fechaSeleccionada = arg.dateStr;
    const eventoEseDia = Array.isArray(this.calendarOptions.events)
          ? this.calendarOptions.events.find((e: any) => e.date === fechaSeleccionada && e.color === 'red')
          : null;

    if (eventoEseDia) {
      alert('Este día ya está ocupado o restringido.');
      return;
    }

    // Aquí lanzas tu modal o formulario para ingresar datos del evento
    const confirmado = confirm(`¿Crear evento el ${fechaSeleccionada}?`);

    if (confirmado && this.sala) {
      // Simulación: podrías abrir un formulario real en lugar de confirm()
      const nuevoEvento = {
        title: 'Evento en revisión',
        date: fechaSeleccionada,
        color: 'red'
      };

      // Aquí deberías llamar a un servicio que cree el evento con estado 'en_revision'
      // this.eventoService.crearEvento({...})

      // Añadir el evento visualmente al calendario
      (this.calendarOptions.events as any[]).push(nuevoEvento);

      // Forzar actualización visual del calendario
      this.calendarOptions = {
        ...this.calendarOptions,
        events: [...(this.calendarOptions.events as any[])]
      };
    }
  }

  evento = {
    nombre: '',
    descripcion: ''
  };

  enviarEvento() {
    if (!this.fechaSeleccionada || !this.sala) return;

    const nuevoEvento = {
      nombre: this.evento.nombre,
      descripcion: this.evento.descripcion,
      fecha: this.fechaSeleccionada,
      salaId: this.sala.id,
      estado: 'EN_REVISION'
    };

    this.salaService.crearEventoEnRevision(nuevoEvento).subscribe(() => {
      // Actualizar el calendario agregando el evento en rojo
      (this.calendarOptions.events as any[]).push({
        title: 'Reservado (en revisión)',
        date: this.fechaSeleccionada,
        color: 'red'
      });

      this.cancelarEvento();
    });
  }

  cancelarEvento() {
    this.mostrarFormularioEvento = false;
    this.fechaSeleccionada = null;
    this.evento = { nombre: '', descripcion: '' };
  }



}
