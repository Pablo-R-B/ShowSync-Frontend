import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
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
  encapsulation: ViewEncapsulation.None,

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
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  fechaSeleccionada: string | null = null;
  mostrarFormularioEvento = false;
  idPromotor: number = 0;
  sala: any;
  generosDisponibles: string[] = [];
  generosSeleccionados: string[] = [];
  cargando = false;
  imagenCargando = false; // Nuevo estado para carga de imagen
  maxFileSize = 5; // MB
  imagenArchivo?: File; // Archivo optimizado para envío

  disponibilidadMap: Map<string, boolean> = new Map();

  nuevoEvento = {
    nombre: '',
    descripcion: '',
    imagenEvento: '' // Para preview
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
    this.eventosService.getGenero().subscribe({
      next: genero => this.generosDisponibles = genero,
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
            display: 'auto',
            className: 'evento-fondo'
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

    if (this.authService.userRole === 'ADMINISTRADOR') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acceso denegado',
        detail: 'Como administrador no tienes acceso a esta función',
        life: 5000
      });
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

  // Método mejorado para subir imagen con redimensionamiento
  // Método simplificado para subir imagen sin usar pica
  onFileSelected(event: any): void {
    const file: File = event.files?.[0];

    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo se permiten archivos de imagen',
        life: 5000
      });
      return;
    }

    // Validar tamaño del archivo
    const maxFileSizeBytes = this.maxFileSize * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `La imagen es muy grande, máximo ${this.maxFileSize} MB`,
        life: 5000
      });
      return;
    }

    this.imagenCargando = true;
    this.imagenArchivo = file;

    // Mostrar preview de la imagen
    const reader = new FileReader();
    reader.onload = () => {
      this.nuevoEvento.imagenEvento = reader.result as string;
      this.imagenCargando = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Imagen cargada correctamente',
        life: 3000
      });
    };

    reader.onerror = () => {
      this.imagenCargando = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la imagen',
        life: 5000
      });
    };

    reader.readAsDataURL(file);
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

    if (!this.imagenArchivo) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Es obligatorio subir una imagen' });
      return;
    }

    this.cargando = true;

    // Construir el DTO con los datos que espera tu backend
    const eventoDTO = {
      nombreEvento: this.nuevoEvento.nombre,
      descripcion: this.nuevoEvento.descripcion,
      fechaEvento: this.fechaSeleccionada,
      idSala: this.sala.id,
      generosMusicales: this.generosSeleccionados
    };

    const formData = new FormData();

    // Aquí conviertes el DTO a Blob JSON y lo agregas con la clave "dto"
    formData.append('dto', new Blob([JSON.stringify(eventoDTO)], { type: 'application/json' }));

    // Agregas la imagen con la clave que espera el backend "imagenArchivo"
    formData.append('imagenArchivo', this.imagenArchivo);

    this.eventosService.crearEventoEnRevision(formData).subscribe({
      next: () => {
        const nuevoEvento: EventInput = {
          title: `${this.nuevoEvento.nombre} (En revisión)`,
          date: this.fechaSeleccionada!,
          color: 'orange',
          textColor: '#08080C'
        };

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
    this.imagenArchivo = undefined; // Limpiar archivo optimizado

    // Limpiar el componente FileUpload
    if (this.fileUpload) {
      this.fileUpload.clear();
      this.fileUpload.files = [];
    }
  }

  mostrarModal = false;

  abrirImagen() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  eliminarImagen(): void {
    this.nuevoEvento.imagenEvento = '';
    this.imagenArchivo = undefined;

    // Limpiar el FileUpload
    if (this.fileUpload) {
      this.fileUpload.clear();
      this.fileUpload.files = [];
    }
  }


}
