import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { CommonModule, DatePipe, NgForOf } from '@angular/common';
import {Promotor} from '../../interfaces/Promotor';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {FormsModule} from '@angular/forms';
import {PromotoresService} from '../../servicios/promotores.service';
import {AuthService} from '../../servicios/auth.service';
import {ArtistasService} from '../../servicios/artistas.service';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import { register } from 'swiper/element/bundle';
register();


@Component({
  selector: 'app-promotores',
  standalone: true,
  imports: [
    CommonModule,
    NgForOf,
    FormsModule
  ],
  providers: [DatePipe],
  templateUrl: './promotores.component.html',
  styleUrls: ['./promotores.component.css'],
  encapsulation: ViewEncapsulation.None,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PromotoresComponent implements OnInit{
  promotor: Promotor | null = null;
  logoUrl: string = '../../../assets/images/logo_1.png';
  eventos: EventoDTO[] = [];
  eventoDestacado?: EventoDTO;
  eventosProximos: Array<{ fecha: string; lugar: string; nombre: string }> = [];
  artistas: Array<{
    id: number;
    generosMusicales: string;
    nombre: string;
    imagenPerfil: string; // <-- ¡Añade la URL de la imagen aquí!
  }> = [];
  idPromotor!: number;
  isModalOpen = false;
  eventoSeleccionado!:number



  constructor(
    private promotoresService: PromotoresService,
    private authService: AuthService,
    private artistasService: ArtistasService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // ✅ Obtenemos el ID desde la URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idPromotor = parseInt(idParam, 10);
      this.obtenerPromotor();
      this.obtenerEventos();
      this.obtenerArtistas();
    } else {
      console.error('No se encontró ID de promotor en la ruta');
    }

    const usuarioId = this.authService.userId;
    if (!usuarioId) {
      console.error('No se encontró un ID de usuario válido');
      return;
    }
  }


  // Obtener los detalles del promotor
  private obtenerPromotor() {
    this.promotoresService.cargarPromotorPorId(this.idPromotor)
      .subscribe(data => {
        this.promotor = data;
        this.logoUrl = data.imagenPerfil;
      });
  }

  // Obtener los eventos del promotor y clasificarlos
  private obtenerEventos() {
    const hoy = new Date();

    this.promotoresService.cargarEventosDePromotor(this.idPromotor)
      .subscribe(data => {
        this.eventos = data.sort((a, b) => {
          const dateA = new Date(a.fechaEvento);
          const dateB = new Date(b.fechaEvento);
          // Ordena en orden descendente (el más nuevo primero)
          return dateB.getTime() - dateA.getTime();
        });

        if (this.eventos.length) {
          this.eventoDestacado = this.eventos[0];
        }

        // Filtrar los eventos futuros
        this.eventosProximos = data
          .filter(e => new Date(e.fechaEvento) > hoy)
          .map(e => ({
            fecha: this.datePipe.transform(e.fechaEvento, 'dd/MM/yyyy')!,
            lugar: e.nombreSala,
            nombre: e.nombreEvento
          }))

      });
  }

// Obtener los artistas asociados al promotor y clasificarlos
  private obtenerArtistas() {
    this.artistasService.artistasPorPromotor(this.idPromotor)
      .subscribe({
        next: (data: any) => {
          console.log('Respuesta del servicio (antes de procesar):', data);

          const artistasRecibidos = Array.isArray(data) ? data : [];

          this.artistas = artistasRecibidos.map((artista: any) => ({
            id: artista.id,
            nombre: artista.nombreArtista,
            generosMusicales: artista.generosMusicales ? artista.generosMusicales.join(', ') : '',
            imagenPerfil: artista.imagenPerfil // <-- ¡Asigna la URL de la imagen del backend!
          }));
        },
        error: (err) => {
          console.error('Error al obtener artistas asociados al promotor:', err);
        }
      });
  }

  navigateToArtistaProfile(artistaId: number): void {
    if (artistaId) {
      this.router.navigate(['/artista', artistaId]);
    } else {
      console.error('ID del artista no válido para navegar al perfil.');
    }
  }


  // Método para ver los detalles de un evento
  verDetallesEvento(eventoId: number) {
    if (!eventoId) {
      console.error('ID del evento no es válido');
      return;
    }

    // Navegar a los detalles del evento
    this.router.navigate([`/eventos/${eventoId}`]);
  }

  // Método para navegar a todos los eventos de un promotor
  verEventosDePromotor(promotorId: number) {
    if (!promotorId) {
      console.error('ID del promotor no válido');
      return;
    }

    // Navegar a la lista de eventos del promotor
    this.router.navigate([`/eventos/promotor/${promotorId}`]);

  }


}
