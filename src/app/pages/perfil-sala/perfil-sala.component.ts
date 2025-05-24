import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalasService } from '../../servicios/salas.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgIf, CommonModule } from '@angular/common';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { EventosService } from '../../servicios/EventosService';
import { EventoCreacion } from '../../interfaces/eventoCreacion';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import {InputText} from 'primeng/inputtext';
import {FileUpload} from 'primeng/fileupload';
import {ButtonDirective} from 'primeng/button';
import {InputTextarea} from 'primeng/inputtextarea';

@Component({
  selector: 'app-perfil-sala',
  standalone: true,
  imports: [
    FullCalendarModule,
    NgIf,
    FormsModule,
    ToastModule,
    DialogModule,
    MultiSelectModule,
    CommonModule,
    InputText,
    FileUpload,
    ButtonDirective,
    InputTextarea
  ],
  templateUrl: './perfil-sala.component.html',
  styleUrls: ['./perfil-sala.component.css'],
  providers: [MessageService]
})
export class PerfilSalaComponent implements OnInit {
  fechaSeleccionada: string | null = null;
  mostrarFormularioEvento = false;
  idPromotor: number = 0;
  sala: any;
  generosDisponibles: string[] = [];
  generosSeleccionados: string[] = [];
  cargando = false;

  nuevoEvento = {
    nombre: '',
    descripcion: '',
    imagenEvento: ''
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    dateClick: this.onDateClick.bind(this),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    locale: 'es',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana'
    }
  };



  constructor(
    private route: ActivatedRoute,
    private salaService: SalasService,
    private eventosService: EventosService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.idPromotor = this.authService.userId;

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarDatosSala(Number(id));

    }
  }

  cargarDatosSala(id: number) {
    this.salaService.obtenerPorId(id).subscribe({
      next: sala => {
        this.sala = sala;
        this.cargarDisponibilidad(id);
        this.cargarGenerosMusicales();
      },
      error: err => {
        console.error('Error al cargar datos de la sala', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información de la sala'
        });
      }
    });
  }

  cargarGenerosMusicales() {
    this.eventosService.getGeneros().subscribe({
      next: generos => this.generosDisponibles = generos,
      error: err => {
        console.error('Error al cargar géneros musicales', err);
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'No se pudieron cargar los géneros musicales'
        });
      }
    });
  }

  private getRandomGreenTone(): string {
    const greenTones = ['#a8e6cf', '#dcedc1', '#b2f2bb', '#c3f9d4', '#d0f4de'];
    return greenTones[Math.floor(Math.random() * greenTones.length)];
  }

  cargarDisponibilidad(salaId: number) {
    const hoy = new Date();

    // Formatea las fechas como 'yyyy-MM-dd'
    const inicioStr = `${hoy.getFullYear()}-${(hoy.getMonth() + 1).toString().padStart(2, '0')}-${hoy.getDate().toString().padStart(2, '0')}`;
    this.salaService.consultarDisponibilidad(salaId, inicioStr).subscribe({
      next: disponibilidad => {
        const eventos = disponibilidad.map((d: any) => ({
          title: d.disponibilidad ? 'Disponible' : 'No disponible',
          date: d.fecha,
          color: d.disponibilidad ? this.getRandomGreenTone() : '#BF0D22',
          editable: false,
          display: 'background'
        }));

        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos,
          eventDataTransform: (eventData: any) => {
            if (eventData.estado === 'CONFIRMADO' || eventData.disponibilidad) {
              return eventData;
            }
            return null;
          }
        };

      },
      error: err => {
        console.error('Error al cargar disponibilidad', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la disponibilidad de la sala'
        });
      }
    });
  }

  onDateClick(arg: any) {
    const fecha = arg.dateStr;
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Eliminar la hora para comparar solo fechas

    if (fechaSeleccionada < hoy) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha no válida',
        detail: 'No se puede seleccionar una fecha anterior a la actual'
      });
      return;
    }

    const eventoExistente = (this.calendarOptions.events as EventInput[]).find(e =>
      e.date === fecha && e.color === '#BF0D22'
    );

    if (!eventoExistente) {
      this.fechaSeleccionada = fecha;
      this.mostrarFormularioEvento = true;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Fecha no disponible',
        detail: 'La sala no está disponible para esta fecha'
      });
    }
  }

  enviarEvento() {
    if (!this.fechaSeleccionada || !this.sala || this.idPromotor === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Falta información necesaria para crear el evento'
      });
      return;
    }

    if (!this.nuevoEvento.nombre || this.generosSeleccionados.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'El nombre del evento y al menos un género musical son obligatorios'
      });
      return;
    }

    this.cargando = true;

    const eventoRequest: EventoCreacion = {
      nombreEvento: this.nuevoEvento.nombre,
      descripcion: this.nuevoEvento.descripcion,
      fechaEvento: this.fechaSeleccionada,
      idSala: this.sala.id,
      generosMusicales: this.generosSeleccionados,
      imagenEvento: this.nuevoEvento.imagenEvento
    };

    this.eventosService.crearEventoEnRevision(eventoRequest).subscribe({
      next: () => {
        const nuevoEvento: EventInput = {
          title: `${this.nuevoEvento.nombre} (En revisión)`,
          date: this.fechaSeleccionada!,
          color: 'orange',
          textColor: '#08080C'
        };

        this.calendarOptions = {
          ...this.calendarOptions,
          events: [...(this.calendarOptions.events as EventInput[]), nuevoEvento]
        };


        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Evento enviado para revisión correctamente'
        });

        this.cancelarEvento();
      },
      error: (error) => {
        console.error('Error al crear evento:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Error al crear el evento'
        });
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  cancelarEvento() {
    this.mostrarFormularioEvento = false;
    this.fechaSeleccionada = null;
    this.nuevoEvento = { nombre: '', descripcion: '', imagenEvento: '' };
    this.generosSeleccionados = [];
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.nuevoEvento.imagenEvento = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
