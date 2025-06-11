import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import {Postulacion} from '../../interfaces/postulacion';
import {Artistas} from '../../interfaces/artistas';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {AuthService} from '../../servicios/auth.service';
import {ArtistasService} from '../../servicios/artistas.service';

@Component({
  selector: 'app-perfil-admin-artista',
  imports: [
    RouterLink,
    DatePipe,
    NgForOf,
    NgIf,
    NgClass,
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


  constructor(private postulacionService: PostulacionEventoService, private authService: AuthService,
              private artistaService: ArtistasService, private eventosService: EventosService) {
  }

  ngOnInit() {
    const userId = this.authService.userId;
    console.log(userId);
    if (userId) {
      this.artistaService.getArtistaIdPorUsuario(userId).subscribe({
        next: (id) => {
          this.artistaId = id;

          console.log("Admin id artista", this.artistaId);

          // Obtener información del artista
          this.artistaService.artistaPorId(id).subscribe({
            next: (artista) => {
              this.artista = artista; // contiene nombreArtista e imagenPerfil
              this.cargarPostulaciones();
            },
            error: (err) => console.error('Error al obtener artista:', err)
          });

          // Cargar postulaciones
          // this.cargarPostulaciones();
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

  respuestaSolicitud(postulacion: Postulacion, estado: 'aceptado' | 'rechazado'): void {
    if (estado === 'aceptado') {
      this.eventosService.aceptarPostulacion(postulacion.id).subscribe({
        next: () => {
          postulacion.estado = 'aceptado'; // Actualiza el estado localmente
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
          postulacion.estado = 'rechazado'; // Actualiza el estado localmente
          this.mostrarModal('exito', 'Enhorabuena', 'Oferta rchazada exitosamente');
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

  cerrarModalYRecargar(): void {
    this.modalVisible = false;
  }



}
