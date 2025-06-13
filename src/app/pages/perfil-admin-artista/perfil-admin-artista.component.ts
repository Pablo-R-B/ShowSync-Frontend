import {Component, OnInit} from '@angular/core';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import {Postulacion} from '../../interfaces/postulacion';
import {Artistas} from '../../interfaces/artistas';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {AuthService} from '../../servicios/auth.service';
import {ArtistasService} from '../../servicios/artistas.service';
import {EventosService} from '../../servicios/eventos.service';
import {EventoConfirmado} from '../../interfaces/EventoConfirmado';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-perfil-admin-artista',
  imports: [
    DatePipe,
    RouterLink,
    NgForOf,
    NgIf
  ],
  templateUrl: './perfil-admin-artista.component.html',
  standalone: true,
  styleUrl: './perfil-admin-artista.component.css'
})
export class PerfilAdminArtistaComponent implements OnInit{

  postulaciones: Postulacion[] = [];
  ofertas: Postulacion[] = [];
  postulacionesPendientes: Postulacion[] = [];
  postulacionesAceptadas: Postulacion[] = [];
  ofertasPendientes: Postulacion[] = [];
  ofertasAceptadas: Postulacion[] = [];
  artistaId!: number;
  artista:Artistas | undefined;
  usuarioRol!:string | null;
  eventos: EventoDTO[] = [];
  modalVisible: boolean = false;
  modalTipo: 'exito' | 'error' | null = null;
  modalMensaje: string = '';
  modalTitulo: string = '';
  eventosConfirmados: EventoConfirmado[] = [];

  constructor(private postulacionService: PostulacionEventoService, private authService: AuthService,
              private artistaService: ArtistasService, private eventosService: EventosService) {
  }

  ngOnInit() {
    const userId = this.authService.userId;
    console.log('User ID:', userId);

    if (userId) {
      this.artistaService.getArtistaIdPorUsuario(userId).subscribe({
        next: (id) => {
          this.artistaId = id;
          console.log("Admin id artista:", this.artistaId);

          // Obtener información del artista
          this.artistaService.artistaPorId(id).subscribe({
            next: (artista) => {
              this.artista = artista; // contiene nombreArtista e imagenPerfil
              this.cargarPostulaciones();
            },
            error: (err) => console.error('Error al obtener artista:', err)
          });

          // Obtener eventos confirmados
          this.cargarEventosConfirmados();
        },
        error: (err) => console.error('Error al obtener artistaId:', err)
      });
    } else {
      console.error('Usuario no identificado');
    }
  }

  cargarPostulaciones(): void {
    const hoy = new Date();
    this.postulacionService.listarPorArtista(this.artistaId).subscribe({
      next: (lista) => {
        // Separar por tipo y estado
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
      error: (err) => console.error('Error cargando postulaciones:', err)
    });
  }

  cargarEventosConfirmados(): void {
    this.eventosService.getEventosConfirmadosPorArtistaId(this.artistaId).subscribe({
      next: (eventos) => {
        this.eventosConfirmados = eventos;
        console.log('Eventos confirmados:', this.eventosConfirmados);
      },
      error: (err) => console.error('Error al obtener eventos confirmados:', err)
    });
  }

  respuestaSolicitud(postulacion: Postulacion, estado: 'aceptado' | 'rechazado'): void {
    if (estado === 'aceptado') {
      this.eventosService.aceptarPostulacion(postulacion.id).subscribe({
        next: () => {
          // Actualizar el estado localmente
          postulacion.estado = 'aceptado';

          // Mover la postulación a la lista correspondiente
          if (postulacion.tipoSolicitud === 'oferta') {
            this.ofertasPendientes = this.ofertasPendientes.filter(p => p.id !== postulacion.id);
            this.ofertasAceptadas.push(postulacion);
          } else {
            this.postulacionesPendientes = this.postulacionesPendientes.filter(p => p.id !== postulacion.id);
            this.postulacionesAceptadas.push(postulacion);
          }

          // Recargar eventos confirmados si es una oferta aceptada
          if (postulacion.tipoSolicitud === 'oferta') {
            this.cargarEventosConfirmados();
          }

          this.mostrarModal('exito', 'Enhorabuena', 'Oferta aceptada exitosamente');
        },
        error: (err) => {
          console.error('Error al aceptar la postulación', err);
          this.mostrarModal('error', 'Lo sentimos', 'Ocurrió un error al aceptar la oferta');
        }
      });
    } else if (estado === 'rechazado') {
      this.postulacionService.actualizarEstadoSolicitud(postulacion.id, estado).subscribe({
        next: () => {
          // Actualizar el estado localmente
          postulacion.estado = 'rechazado';

          // Eliminar de la lista correspondiente
          if (postulacion.tipoSolicitud === 'oferta') {
            this.ofertasPendientes = this.ofertasPendientes.filter(p => p.id !== postulacion.id);
          } else {
            this.postulacionesPendientes = this.postulacionesPendientes.filter(p => p.id !== postulacion.id);
          }

          this.mostrarModal('exito', 'Enhorabuena', 'Oferta rechazada exitosamente');
        },
        error: (err) => {
          console.error('Error al rechazar la postulación', err);
          this.mostrarModal('error', 'Lo sentimos', 'Ocurrió un error al rechazar la oferta');
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

  cerrarModal(): void {
    this.modalVisible = false;
  }
}
