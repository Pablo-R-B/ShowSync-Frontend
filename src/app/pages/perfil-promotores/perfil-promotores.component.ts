import {AfterViewInit, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {DatePipe, NgClass, NgForOf, NgIf, SlicePipe} from '@angular/common';
import {PromotoresService} from '../../servicios/promotores.service';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {Promotor} from '../../interfaces/Promotor';
import {SalasService} from '../../servicios/salas.service';
import {EventosService} from '../../servicios/eventos.service';
import {Sala} from '../../interfaces/sala';
import {Postulacion} from '../../interfaces/postulacion';
import {AuthService} from '../../servicios/auth.service';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-perfil-promotores',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    NgIf,
    DatePipe,
    FormsModule,
    SlicePipe,
    NgClass,
  ],
  providers: [DatePipe],
  templateUrl: './perfil-promotores.component.html',
  styleUrls: ['./perfil-promotores.component.css']
})
export class PerfilPromotoresComponent implements OnInit,AfterViewInit {




  promotor: Promotor | null = null;
  logoUrl: string = '../../../assets/images/logo_1.png';
  salas: Sala[] = [];
  eventos: EventoDTO[] = [];
  eventosConfirmados: EventoDTO[] = []; // Filtered confirmed events
  eventosEnRevision: EventoDTO[] = []; // Filtered 'En Revisión' events
  eventoDestacado?: EventoDTO;
  eventosProximos: Array<{ fecha: string; lugar: string; nombre: string }> = [];

  idUsuario!: number;
  idPromotor!: number;
  postulaciones: Postulacion[] = [];
  ofertas: Postulacion[] = [];
  postulacionesPendientes: Postulacion[] = [];
  postulacionesAceptadas: Postulacion[] = [];
  ofertasPendientes: Postulacion[] = [];
  ofertasAceptadas: Postulacion[] = [];
  modalVisible: boolean = false;
  modalTipo: 'exito' | 'error' | null = null;
  modalMensaje: string = '';
  modalTitulo: string = '';


  usuarioRol!:string | null;




  selectedTab: 'Confirmado' | 'En Revisión' = 'Confirmado';








  constructor(
    private promotoresService: PromotoresService,
    private salasService: SalasService,
    private eventosService: EventosService,
    private postulacionService: PostulacionEventoService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private cd :ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.obtenerPerfilUsuario();
    this.idUsuario = parseInt(localStorage.getItem('userId') ?? '0', 10);
    this.usuarioRol=this.authService.userRole;

    this.promotoresService.getPromotorPorIdUsuario(this.idUsuario).subscribe({
      next: (promotor) => {
        this.idPromotor = promotor.id;
        this.cargarSolicitudes();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener el promotor:', err);
      }
    });
  }




  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }




  private obtenerPerfilUsuario(): void {
    this.promotoresService.getPerfilUsuario().subscribe({
      next: (perfilUsuario) => {
        const idUsuario = perfilUsuario.id;
        console.log('ID del usuario autenticado:', idUsuario);

        this.promotoresService.getPromotorPorIdUsuario(idUsuario).subscribe({
          next: (data: Promotor) => {
            console.log('Promotor recibido:', data);
            this.promotor = data;
            this.logoUrl = data.imagenPerfil || this.logoUrl;
            this.idPromotor = data.id;
            this.obtenerEventos();
            this.cargarSalas();
            this.cd.detectChanges();
          },
          error: (err) => {
            console.error('Error al obtener datos del promotor', err);

          }
        });
      },
      error: (err) => {
        console.error('Error al obtener perfil del usuario', err);

      }
    });
  }

  editarMiPerfil(): void {
    // Aquí defines lo que quieres que haga el botón
    // Por ejemplo, redirigir a la página de editar perfil:
    this.router.navigate(['/editar-perfil']);
  }



  private obtenerEventos() {
    if (!this.idPromotor) return;

    const hoy = new Date();

    this.promotoresService.cargarEventosDePromotor(this.idPromotor)
      .subscribe({
        next: (data) => {
          this.eventos = data; // Assign all events first
          this.filterEventsByStatus(); // Always filter after loading all events




          // Now, set eventoDestacado based on the ALL events, if any
          if (this.eventos.length > 0) {
            this.eventoDestacado = this.eventos[0];
          } else {
            this.eventoDestacado = undefined; // Clear if no events
          }

          this.eventosProximos = data
            .filter(e => new Date(e.fechaEvento) > hoy)
            .map(e => ({
              fecha: this.datePipe.transform(e.fechaEvento, 'dd/MM/yyyy')!,
              lugar: e.nombreSala,
              nombre: e.nombreEvento
            }));
        },
        error: (err) => console.error('Error al cargar eventos', err)
      });
  }




  // New method to filter events by status
  filterEventsByStatus(): void {
    this.eventosConfirmados = this.eventos.filter(evento => evento.estado === 'confirmado');
    this.eventosEnRevision = this.eventos.filter(evento => evento.estado === 'en_revision')




  }




  // New method to change the selected tab
  selectTab(tab: 'Confirmado' | 'En Revisión'): void {
    console.log('Cambiando a la pestaña:', tab);
    this.selectedTab = tab;
    this.cd.detectChanges();
  }




  editarEvento(evento: EventoDTO): void {
    this.router.navigate(['/eventos/editar', evento.id]);
  }

  eliminarEvento(eventoId: number): void {
    if (!this.promotor) {
      console.error('No hay promotor cargado para eliminar el evento');
      return;
    }

    if (!confirm('¿Seguro que deseas eliminar este evento?')) {
      return;
    }

    this.eventosService.eliminarEvento(this.promotor.id, eventoId)
      .subscribe({
        next: () => {
          alert('Evento eliminado correctamente');
          this.obtenerEventos();  // refrescar lista
        },
        error: (err) => console.error('Error al eliminar evento', err)
      });
  }




  confirmarEvento(eventoId: number): void {
    if (!this.promotor) {
      console.error('No hay promotor cargado para confirmar el evento');
      return;
    }


    this.eventosService.confirmarEvento(eventoId).subscribe({
      next: () => {
        alert('Evento confirmado correctamente');
        this.obtenerEventos(); // Refrescar la lista para actualizar el estado
      },
      error: (err) => console.error('Error al confirmar evento', err)
    });
  }






  cargarSalas(): void {
    if (!this.promotor?.id) return;

    this.salasService.obtenerTodas()
      .subscribe({
        next: (data) => {
          this.salas = data;
        },
        error: (err) => {
          console.error('Error al cargar salas', err);
          this.salas = [];
        }
      });
  }








  cargarSolicitudes() {
    const hoy = new Date();
    this.postulacionService.listarPorPromotor(this.idPromotor).subscribe({
      next: (lista) => {
        console.log("Lista completa:", lista);

        // Separando solicitudes según el tipo
        this.postulacionesPendientes = lista.filter(
          post => post.tipoSolicitud === 'postulacion' && post.estado === 'pendiente'
        );

        this.postulacionesAceptadas = lista.filter(
          post => post.tipoSolicitud === 'postulacion' && post.estado === 'aceptado'
        );

        this.ofertasPendientes = lista.filter(
          post => post.tipoSolicitud === 'oferta' && post.estado === 'pendiente'
        );

        this.ofertasAceptadas = lista.filter(
          post => post.tipoSolicitud === 'oferta' && post.estado === 'aceptado'
        );
      },
      error: (err) => console.error('Error cargando solicitudes:', err)
    });
  }




  respuestaSolicitud(postulacion: Postulacion, estado: 'aceptado' | 'rechazado'): void {
    if (estado === 'aceptado') {
      this.eventosService.aceptarPostulacion(postulacion.id).subscribe({
        next: () => {
          postulacion.estado = 'aceptado'; // Actualiza el estado localmente
          this.mostrarModal('exito', 'Enhorabuena', 'Postulación aceptada exitosamente')
        },
        error: (err) => {
          console.error('Error al aceptar la postulación', err);
          this.mostrarModal('error', 'Lo sentimos', 'Ocurrió un error al aceptar la postulación');
        }
      });
    } else if (estado === 'rechazado') {
      this.postulacionService.actualizarEstadoSolicitud(postulacion.id, estado).subscribe({
        next: () => {
          postulacion.estado = 'rechazado'; // Actualiza el estado localmente
          this.mostrarModal('exito', 'Enhorabuena', 'Postulación rechazada exitosamente')
        },
        error: (err) => {
          console.error('Error al rechazar la postulación', err);
          this.mostrarModal('error', 'Lo sentimos', 'Ocurrió un error al rechazar la postulación');
        }
      });
    }
  }

  mostrarModal(tipo: 'exito' | 'error', titulo: string, mensaje: string): void {
    this.modalTipo = tipo;
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalVisible = true;
  }

  cerrarModalYRecargar(): void {
    this.modalVisible = false;
  }





}

