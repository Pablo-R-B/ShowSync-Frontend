import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {DatePipe,NgIf} from '@angular/common';
import {EventosService} from '../../servicios/eventos.service';
import {AuthService} from '../../servicios/auth.service';
import {ArtistasService} from '../../servicios/artistas.service';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';


@Component({
  selector: 'app-eventos',
  standalone: true,  // Marca el componente como standalone
  templateUrl: './eventos.component.html',
  imports: [
    DatePipe,
    NgIf,
  ],
  styleUrls: ['./eventos.component.css']
})
export class EventosComponent implements OnInit {
  evento: any;
  artistaId!: number;
  idEvento!:number;


  constructor(
    private eventosService: EventosService,
    private authService: AuthService,
    private artistasService: ArtistasService,
    private postulacionService:PostulacionEventoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el ID de la URL
    const eventoId = this.route.snapshot.paramMap.get('id') ?? '';
    this.idEvento = Number(eventoId);

    if (eventoId) {
      this.cargarEvento(eventoId);
    } else {
      console.error('ID del evento no encontrado');
    }

    const usuarioId = localStorage.getItem('userId');

    if (usuarioId) {
      this.artistasService.getArtistaIdPorUsuario(Number(usuarioId)).subscribe(
        (artistaId) => {
          console.log('ID del artista:', artistaId);
          this.artistaId = artistaId; // Guardarlo para usarlo más adelante
        },
        (error) => {
          console.error('Error al obtener el ID del artista:', error);
        }
      );
    }
  }

  cargarEvento(eventoId: string): void {
    // Llamada al servicio para obtener los detalles del evento por ID
    this.eventosService.getEventoPorId(eventoId).subscribe(
      (data) => {
        this.evento = data;
      },
      (error) => {
        console.error('Error al cargar el evento', error);
      }
    );
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
    this.postulacionService.nuevaSolicitud(this.idEvento, this.artistaId)
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
}
