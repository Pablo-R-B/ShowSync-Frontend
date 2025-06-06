import {Component, Input, OnInit} from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../servicios/auth.service';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import {Postulacion} from '../../interfaces/postulacion';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {PromotoresService} from '../../servicios/promotores.service';
import {GeneroMusical} from '../../interfaces/GeneroMusical';


@Component({
  selector: 'app-perfil-artista',
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
    RouterLink
  ],
  templateUrl: './perfil-artista.component.html',
  standalone: true,
  styleUrl: './perfil-artista.component.css'
})
export class PerfilArtistaComponent implements OnInit{
  artista:Artistas | undefined;
  @Input() mostrarModal = false;
  eventoSeleccionado!:number
  IdUsuarioDePromotor!: number;
  eventos: EventoDTO[] = [];
  generos: GeneroMusical[] = [];
  usuarioRol!:string | null;
  artistaVisualizadoId!: number;
  artistaLogueadoId!: number;


  constructor(private artistasService:ArtistasService, private route: ActivatedRoute,
              private promotoresService: PromotoresService, private authService: AuthService,
              private postulacionService:PostulacionEventoService) {
  }

  ngOnInit() {
    const userId = this.authService.userId;
    this.usuarioRol = this.authService.userRole
    this.IdUsuarioDePromotor = this.authService.userId;
    this.route.paramMap.subscribe(params => {
      this.artistaVisualizadoId = Number(params.get('id'));

      if (this.artistaVisualizadoId) {
        this.artistasService.artistaPorId(this.artistaVisualizadoId).subscribe(
          data => { this.artista = data; },
          err => console.error('Error obteniendo artista de la URL:', err)
        );
      }
    });

    if (this.usuarioRol === 'ARTISTA' && userId) {
      this.artistasService.getDatosArtistaPorUsuarioId(userId).subscribe(
        artista => {
          this.artistaLogueadoId = artista.id;
        },
        err => console.error('Error obteniendo artista logueado:', err)
      );
    }

    if(this.usuarioRol === 'PROMOTOR'){
      this.cargarEventosPromotor();
    }

    const artistaId = Number(this.route.snapshot.paramMap.get('id'));

    this.artistasService.getGenerosDelArtista(artistaId).subscribe(generos => {
      this.generos = generos;
    });




  }



  cargarEventosPromotor(): void {
    this.promotoresService.listarEventosPorUsuarioDePromotor(this.IdUsuarioDePromotor).subscribe({
      next:(data: EventoDTO[]) => this.eventos = data,
      error: err => console.error('Error al cargar eventos:', err)
      }

    )

  }

  cerrarModal() {
    this.mostrarModal = false;
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
    this.route.paramMap.subscribe(params => {
      const artistaId = Number(params.get('id'));

      this.postulacionService.nuevaSolicitud(this.eventoSeleccionado, artistaId)
        .subscribe({
          next: response => {
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
                this.alertaSolicitud('noenviada', `Error inesperado (status ${response.status})`);
            }
          },
          error: err => {
            const status = err.status ?? 'desconocido';
            const msg = err?.error?.message ?? 'No se pudo enviar la solicitud.';
            this.alertaSolicitud('noenviada', `Error en la solicitud : ${msg}`);
          }
        });
    });

    }

  }
