import {Component, Input, OnInit} from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {PromotoresService} from '../../servicios/PromotoresService';
import {ArtistasService} from '../../servicios/artistas.service';
import {ActivatedRoute} from '@angular/router';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../servicios/auth.service';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import {Postulacion} from '../../interfaces/postulacion';
import {EventoDTO} from '../../interfaces/EventoDTO';


@Component({
  selector: 'app-perfil-artista',
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    NgForOf
  ],
  templateUrl: './perfil-artista.component.html',
  styleUrl: './perfil-artista.component.css'
})
export class PerfilArtistaComponent implements OnInit{
  artista:Artistas | undefined;
  @Input() mostrarModal = false;
  eventoSeleccionado!:number
  IdUsuarioDePromotor!: number;
  eventos: EventoDTO[] = [];
  artistaId!: number;
  usuarioRol!:string | null;
  postulaciones: Postulacion[] = [];

  constructor(private artistasService:ArtistasService, private route: ActivatedRoute,
              private promotoresService: PromotoresService, private authService: AuthService,
              private postulacionService:PostulacionEventoService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.artistaId = Number(params.get('id'));
      if (this.artistaId) {
        this.artistasService.artistaPorId(+this.artistaId).subscribe(
          data => { this.artista = data; },
          err  => console.error('Error HTTP:', err)
        );
      } else {
        console.error('ID no encontrado en la URL');
      }
    });
    this.IdUsuarioDePromotor = this.authService.userId;
    console.log("Usuario promtor", this.IdUsuarioDePromotor)
    console.log("Artista id", this.artistaId)
    this.usuarioRol = this.authService.userRole
    console.log("Rol usuario", this.usuarioRol);

    if(this.usuarioRol === 'PROMOTOR'){
      this.cargarEventosPromotor();
    }

    // this.cargarPostulaciones();

    console.log("Artista id", this.artistaId)
    this.usuarioRol = this.authService.userRole;
    console.log("Rol usuario", this.usuarioRol);

    if(this.usuarioRol === 'PROMOTOR'){
      this.cargarEventosPromotor();
    }

    this.cargarPostulaciones();



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

  cargarPostulaciones(): void {
    this.postulacionService.listarPorArtista(this.artistaId)
      .subscribe(data => this.postulaciones = data);
  }

  respuestaSolicitud(post: Postulacion, estado: 'aceptado' | 'rechazado') {
    this.postulacionService.actualizarEstadoSolicitud(post.id, estado)
      .subscribe(() => post.estado = estado);
  }

  }
