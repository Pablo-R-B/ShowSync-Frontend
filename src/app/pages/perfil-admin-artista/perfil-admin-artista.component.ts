import {Component, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
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
    NgClass
  ],
  templateUrl: './perfil-admin-artista.component.html',
  standalone: true,
  styleUrl: './perfil-admin-artista.component.css'
})
export class PerfilAdminArtistaComponent implements OnInit{

  postulaciones: Postulacion[] = [];
  ofertas: Postulacion[] = [];
  artistaId!: number;
  artista:Artistas | undefined;
  usuarioRol!:string | null;
  eventos: EventoDTO[] = [];

  constructor(private postulacionService: PostulacionEventoService, private authService: AuthService,
              private artistaService: ArtistasService,) {
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
            },
            error: (err) => console.error('Error al obtener artista:', err)
          });

          // Cargar postulaciones
          this.cargarPostulaciones();
        },
        error: (err) => console.error('Error al obtener artistaId:', err)
      });
    } else {
      console.error('Usuario no identificado');
    }
  }

  cargarPostulaciones(): void {
    this.postulacionService.listarPorArtista(this.artistaId).subscribe({
      next: (lista) => {
        // Separar por tipo y estado
        this.postulaciones = lista.filter(post => post.tipoSolicitud === 'postulacion' && post.estado !== 'rechazado');
        this.ofertas = lista.filter(post => post.tipoSolicitud === 'oferta' && post.estado !== 'rechazado');

        console.log("Postulaciones:", this.postulaciones);
        console.log("Ofertas:", this.ofertas);
      },
      error: (err) => console.error('Error cargando postulaciones:', err)
    });
  }

  respuestaSolicitud(post: Postulacion, estado: 'aceptado' | 'rechazado') {
    this.postulacionService.actualizarEstadoSolicitud(post.id, estado)
      .subscribe(() => {
        post.estado = estado;

        if (estado === 'rechazado') {
          this.postulaciones = this.postulaciones.filter(p => p.id !== post.id);
          this.ofertas = this.ofertas.filter(p => p.id !== post.id);
        }
      });
  }

}
