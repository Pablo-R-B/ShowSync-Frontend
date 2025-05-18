import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import { CommonModule, DatePipe, NgForOf } from '@angular/common';

import {Promotor} from '../../interfaces/Promotor';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {PromotoresService} from '../../servicios/PromotoresService';
import {FormsModule} from '@angular/forms';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import {AuthService} from '../../servicios/auth.service';
import {ArtistasService} from '../../servicios/artistas.service';
import {Postulacion} from '../../interfaces/postulacion';

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
  styleUrls: ['./promotores.component.css']
})
export class PromotoresComponent implements OnInit {
  promotor: Promotor | null = null;
  logoUrl: string = 'logo_1.png';

  eventos: EventoDTO[] = [];
  eventoDestacado?: EventoDTO;
  eventosProximos: Array<{ fecha: string; lugar: string; nombre: string }> = [];
  eventoSeleccionado!:number
  artistas: Array<{ nombre: string }> = [];
  artistaId!: number;
  usuarioRol!:string | null;
  idPromotor!: number;
  postulaciones: Postulacion[] = [];

  constructor(
    private promotoresService: PromotoresService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private postulacionService:PostulacionEventoService,
    private authService: AuthService,
    private artistasService: ArtistasService
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
    this.artistasService.getArtistaIdPorUsuario(usuarioId).subscribe({
      next: (id: number) => {
        this.artistaId = id;
        console.log('Artista ID cargado:', this.artistaId);

      }, error:(err) => {
        console.error('Error al obtener artistaId para usuario', usuarioId, err)
      }
    })

    this.usuarioRol=this.authService.userRole;
    this.idPromotor = this.authService.userId;
    this.cargarSolicitudes();

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
        this.eventos = data;

        if (data.length) {
          // Establecer el evento destacado
          this.eventoDestacado = data[0];
        }

        // Filtrar los eventos futuros
        this.eventosProximos = data
          .filter(e => new Date(e.fechaEvento) > hoy)
          .map(e => ({
            fecha: this.datePipe.transform(e.fechaEvento, 'dd/MM/yyyy')!,
            lugar: e.nombreSala,
            nombre: e.nombreEvento
          }));
      });
  }

  // Obtener los artistas asociados al promotor
  private obtenerArtistas() {
    this.promotoresService.cargarArtistasDePromotor(this.idPromotor)
      .subscribe(data => this.artistas = data);
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

  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  alerta = {
    tipo: '' as'enviada' | 'noenviada',
    mensaje:'',
    visible:false
  }

  private alertaSolicitud(tipo:'enviada' | 'noenviada', mensaje:string):  void{
    this.alerta = {tipo, mensaje, visible:true}
    setTimeout(()=>{
      this.alerta.visible = false;
    }, 5000);
  }

  enviarOferta() {
    this.postulacionService.nuevaSolicitud(this.eventoSeleccionado, this.artistaId)
      .subscribe({
        next: response =>{
          switch (response.status) {
            case 201:
              this.alertaSolicitud('enviada', '¡Oferta enviada con éxito! 🎉');
              break;
            case 400:
              this.alertaSolicitud('noenviada', 'Solicitud inválida. Revisa los datos.');
              break;
            case 409:
              this.alertaSolicitud('noenviada', 'Ya existe una oferta/postulación previa.');
              break;
            default:
              this.alertaSolicitud(
                'noenviada',
                `Respuesta inesperada: ${response.status}`
              );
              console.warn(`Status inesperado: ${response.status}`);
          }
        },
        error: (err) => {
          // Puede venir un 500, un timeout, o un 0 si no hay conexión
          console.error('Error al enviar la oferta:', err);
          // Extrae el código si está disponible
          const status = err.status ?? 'desconocido';
          this.alertaSolicitud(
            'noenviada',
            `Error en la solicitud (status ${status})`
          );
        },
      });
  }

  cargarSolicitudes() {
    this.postulacionService
      .listarPorPromotor(this.idPromotor)
      .subscribe({
        next: (lista) => this.postulaciones = lista,
        error: (err) => console.error('Error cargando solicitudes:', err)
      });
  }

  respuestaSolicitud(post: Postulacion, estado: 'aceptado' | 'rechazado') {
    this.postulacionService.actualizarEstadoSolicitud(post.id, estado)
      .subscribe(() => post.estado = estado);
  }


}
