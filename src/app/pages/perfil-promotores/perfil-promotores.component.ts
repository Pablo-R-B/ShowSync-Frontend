import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {PromotoresService} from '../../servicios/promotores.service';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {Promotor} from '../../interfaces/Promotor';
import {SalasService} from '../../servicios/salas.service';
import {EventosService} from '../../servicios/eventos.service';
import {Sala} from '../../interfaces/sala';
import {Postulacion} from '../../interfaces/postulacion';
import {AuthService} from '../../servicios/auth.service';
import {ArtistasService} from '../../servicios/artistas.service';
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
    NgClass,
    FormsModule
  ],
  providers: [DatePipe],
  templateUrl: './perfil-promotores.component.html',
  styleUrls: ['./perfil-promotores.component.css']
})
export class PerfilPromotoresComponent implements OnInit {

  promotor: Promotor | null = null;
  logoUrl: string = '../../../assets/imges/logo_1.png';
  salas: Sala[] = [];
  eventos: EventoDTO[] = [];
  eventoDestacado?: EventoDTO;
  eventosProximos: Array<{ fecha: string; lugar: string; nombre: string }> = [];

  idUsuario!: number;
  idPromotor!: number;
  postulaciones: Postulacion[] = [];
  ofertas: Postulacion[] = [];
  usuarioRol!:string | null;


  constructor(
    private promotoresService: PromotoresService,
    private salasService: SalasService,
    private eventosService: EventosService,
    private postulacionService: PostulacionEventoService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.obtenerPerfilUsuario();
    this.idUsuario = parseInt(localStorage.getItem('userId') ?? '0', 10);
    this.usuarioRol=this.authService.userRole;

    this.promotoresService.getPromotorPorIdUsuario(this.idUsuario).subscribe({
      next: (promotor) => {
        this.idPromotor = promotor.id;
        this.cargarSolicitudes();
      },
      error: (err) => {
        console.error('Error al obtener el promotor:', err);
      }
    });



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
          },
          error: (err) => {
            console.error('Error al obtener datos del promotor', err);
            this.router.navigate(['/login']);
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener perfil del usuario', err);
        this.router.navigate(['/login']);
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
          this.eventos = data;
          if (data.length > 0) {
            this.eventoDestacado = data[0];
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

  confirmarSala(salaId: number): void {
    this.salasService.confirmarSala(salaId)
      .subscribe({
        next: () => {
          alert('Sala confirmada correctamente');
          this.cargarSalas(); // refrescar listado tras confirmar
        },
        error: (err) => console.error('Error al confirmar sala', err)
      });
  }

  rechazarSala(salaId: number): void {
    this.salasService.rechazarSala(salaId)
      .subscribe({
        next: () => {
          alert('Sala rechazada correctamente');
          this.cargarSalas(); // refrescar listado tras rechazar
        },
        error: (err: any) => console.error('Error al rechazar sala', err)
      });
  }


  cargarSolicitudes() {
    this.postulacionService.listarPorPromotor(this.idPromotor).subscribe({
      next: (lista) => {
        console.log("Lista completa:", lista);

        // Separando solicitudes según el tipo
        this.postulaciones = lista.filter(post => post.tipoSolicitud === 'postulacion');
        this.ofertas = lista.filter(post => post.tipoSolicitud === 'oferta');

        console.log("Postulaciones:", this.postulaciones);
        console.log("Ofertas:", this.ofertas);
      },
      error: (err) => console.error('Error cargando solicitudes:', err)
    });
  }

  respuestaSolicitud(post: Postulacion, estado: 'aceptado' | 'rechazado') {
    this.postulacionService.actualizarEstadoSolicitud(post.id, estado)
      .subscribe(() => post.estado = estado);
  }

}
