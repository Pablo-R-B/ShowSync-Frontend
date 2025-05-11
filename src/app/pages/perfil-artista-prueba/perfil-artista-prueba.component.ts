import {Component, Input, OnInit} from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {ActivatedRoute} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {EventoDTO, PromotoresService} from '../../servicios/PromotoresService';
import {AuthService} from '../../servicios/auth.service';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';


@Component({
  selector: 'app-perfil-artista-prueba',
  imports: [
    NgIf,
    FormsModule,
    NgForOf
  ],
  templateUrl: './perfil-artista-prueba.component.html',
  standalone: true,
  styleUrl: './perfil-artista-prueba.component.css'
})
export class PerfilArtistaPruebaComponent implements OnInit{
  artista:Artistas | undefined;
  @Input() mostrarModal = false;
  eventoSeleccionado!:number
  IdUsuarioDePromotor!: number;
  eventos: EventoDTO[] = [];
  artistaId!: number;

  constructor(private artistasService:ArtistasService, private route: ActivatedRoute,
              private promotoresService: PromotoresService, private authService: AuthService,
              private postulacionService:PostulacionEventoService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.artistasService.artistaPorId(+id).subscribe(
          data => { this.artista = data; },
          err  => console.error('Error HTTP:', err)
        );
      } else {
        console.error('ID no encontrado en la URL');
      }
    });
    this.IdUsuarioDePromotor = this.authService.userId;
    console.log("Usuario promtor", this.IdUsuarioDePromotor)
    this.cargarEventosPromotor();
    this.artistaId = Number(this.route.snapshot.paramMap.get('id'));


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
    this.postulacionService.enviarOfertaEventoArtista(this.eventoSeleccionado, this.artistaId)
      .subscribe({
        next: response =>{
          if(response.status === 201){
            this.alertaSolicitud('enviada', 'Solicitud enviada')
          }else{
            this.alertaSolicitud('noenviada', 'Respuesta inesperada. No se puedo enviar la solicitud')
            console.error(`Respuesta inesperada: ${response.status}`)
          }
        },
        error: err =>{
          console.error('Error en la oferta', err)
          this.alertaSolicitud('noenviada', 'No se pudo enviar la solicicitud')
        }

      })
  }
  }
