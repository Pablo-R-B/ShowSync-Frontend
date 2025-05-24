import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalasService } from '../../servicios/salas.service';
import { AuthService } from '../../servicios/auth.service';
import { MessageService } from 'primeng/api';
import { EventoCreacion } from '../../interfaces/eventoCreacion';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { FileUpload } from 'primeng/fileupload';
import { ButtonDirective } from 'primeng/button';
import { InputTextarea } from 'primeng/inputtextarea';
import {FullCalendarComponent} from '@fullcalendar/angular';
import {SharedModule} from '../../shared/shared.module';
import {EventosService} from '../../servicios/eventos.service';

@Component({
  selector: 'app-perfil-sala',
  standalone: true,
  imports: [
    NgIf,
    CommonModule,
    FormsModule,
    ToastModule,
    DialogModule,
    MultiSelectModule,
    InputText,
    FileUpload,
    ButtonDirective,
    InputTextarea,
    SharedModule
  ],
  templateUrl: './perfil-sala.component.html',
  styleUrls: ['./perfil-sala.component.css'],
  providers: [MessageService]
})
export class PerfilSalaComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  fechaSeleccionada: string | null = null;
  mostrarFormularioEvento = false;
  idPromotor: number = 0;
  sala: any;
  generosDisponibles: string[] = [];
  generosSeleccionados: string[] = [];
  cargando = false;

  disponibilidadMap: Map<string, boolean> = new Map();

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
        this.cargarFechasNoDisponibles(id);
        this.cargarGenerosMusicales();
      },
      error: err => {
        console.error('Error al cargar datos de la sala', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la sala' });
      }
    });
  }


  cargarGenerosMusicales() {
    this.eventosService.getGeneros().subscribe({
      next: generos => this.generosDisponibles = generos,
      error: err => {
        console.error('Error al cargar géneros', err);
        this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Error al cargar géneros' });
      }
    });
  }

  private getRandomGreenTone(): string {
    const greenTones = ['#a8e6cf', '#dcedc1', '#b2f2bb', '#c3f9d4', '#d0f4de'];
    return greenTones[Math.floor(Math.random() * greenTones.length)];
  }



  cargarFechasNoDisponibles(salaId: number) {
    this.salaService.obtenerFechasNoDisponibles(salaId).subscribe({
      next: (fechas) => {
        this.disponibilidadMap.clear();
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.removeAllEvents();

        fechas.forEach((f: any) => {
          this.disponibilidadMap.set(f.fecha, f.disponibilidad);

          let color = f.disponibilidad ? this.getRandomGreenTone() : '#BF0D22';
          if (!f.disponibilidad) {
            if (f.estadoEvento === 'confirmado') color = '#1B998B';
            else if (f.estadoEvento === 'en_revision') color = '#BF0D22';
            else if (f.estadoEvento === 'publicado') color = '#FF6B6B';
            else color = '#BF0D22';
          }

          calendarApi.addEvent({
            title: f.disponibilidad ? 'Disponible' : 'Evento reservado',
            date: f.fecha,
            color,
            editable: false,
            display: 'background'
          });
        });
      },
      error: (err) => {
        console.error('Error al cargar fechas no disponibles', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar fechas' });
      }
    });
  }

  onDateClick(arg: any) {
    const fecha = arg.dateStr;
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      this.messageService.add({ severity: 'warn', summary: 'Fecha no válida', detail: 'No es posible crear un evento en el pasado.' });
      return;
    }

    const estaDisponible = this.disponibilidadMap.get(fecha);
    if (estaDisponible === false) {
      this.messageService.add({ severity: 'warn', summary: 'Fecha no disponible', detail: 'No disponible' });
      return;
    }

    this.fechaSeleccionada = fecha;
    this.mostrarFormularioEvento = true;
  }

  enviarEvento() {
    if (!this.fechaSeleccionada || !this.sala || this.idPromotor === 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Faltan datos' });
      return;
    }

    if (!this.nuevoEvento.nombre || this.generosSeleccionados.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Nombre y géneros requeridos' });
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

        // Agrega el evento directamente a FullCalendar
        this.calendarComponent.getApi().addEvent(nuevoEvento);

        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Evento enviado correctamente' });
        this.cancelarEvento();
      },
      error: (error) => {
        console.error('Error al crear evento:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.error?.message || 'Error al crear evento' });
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

  mostrarModal = false;

  abrirImagen() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }
}
