import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {PromotoresService} from '../../servicios/PromotoresService';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {Promotor} from '../../interfaces/Promotor';
import {SalasService} from '../../servicios/salas.service';
import {EventosService} from '../../servicios/EventosService';
import {Sala} from '../../interfaces/Sala';

@Component({
  selector: 'app-perfil-promotores',
  standalone: true,
  imports: [
    RouterLink,
    NgForOf,
    NgIf,
    DatePipe
  ],
  providers: [DatePipe],
  templateUrl: './perfil-promotores.component.html',
  styleUrls: ['./perfil-promotores.component.css']
})
export class PerfilPromotoresComponent implements OnInit {

  promotor: Promotor | null = null;
  logoUrl: string = 'logo_1.png';
  salas: Sala[] = [];
  eventos: EventoDTO[] = [];
  eventoDestacado?: EventoDTO;
  eventosProximos: Array<{ fecha: string; lugar: string; nombre: string }> = [];

  idPromotor!: number;

  constructor(
    private promotoresService: PromotoresService,
    private salasService: SalasService,
    private eventosService: EventosService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.obtenerPerfilUsuario();
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

  abrirFormularioCrearEvento(): void {
    this.router.navigate(['/eventos/crear']);
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

    this.salasService.obtenerSalas(this.promotor.id)
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
}
