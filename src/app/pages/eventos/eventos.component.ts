import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {DatePipe,NgIf} from '@angular/common';
import {EventosService} from '../../servicios/eventos.service';
import {AuthService} from '../../servicios/auth.service';
import {ArtistasService} from '../../servicios/artistas.service';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import Swal from 'sweetalert2';


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
    protected authService: AuthService,
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

  mostrarToast(tipo: 'success' | 'error', mensaje: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'center',
      iconColor: 'white',
      customClass: {
        popup: 'colored-toast',
      },
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });

    Toast.fire({
      icon: tipo,
      title: mensaje,
    });
  }


  enviarOferta() {
    if (this.authService.userRole === 'ADMINISTRADOR' || this.authService.userRole === 'PROMOTOR') {
      this.mostrarToast('error', 'Solo los artistas pueden postularse a eventos.');
      return;
    }
    const fechaEvento = new Date(this.evento.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaEvento < hoy) {
      this.mostrarToast('error', 'No puedes postularte a un evento pasado.');
      return;
    }

    this.postulacionService.nuevaSolicitud(this.idEvento, this.artistaId).subscribe({
      next: (response) => {
        switch (response.status) {
          case 201:
            this.mostrarToast('success', '¡Oferta enviada con éxito! 🎉');
            break;
          case 400:
            this.mostrarToast('error', 'Solicitud inválida. Revisa los datos.');
            break;
          case 409:
            this.mostrarToast('error', 'Ya existe una oferta/postulación previa.');
            break;
          default:
            this.mostrarToast('error', `Respuesta inesperada: ${response.status}`);
            console.warn(`Status inesperado: ${response.status}`);
        }
      },
      error: (err) => {
        const mensaje = err.error?.message ?? 'Error desconocido';
        console.error(`Error al enviar la oferta: ${mensaje}`);
        this.mostrarToast('error', `Error en la solicitud: ${mensaje}`);
      },
    });
  }

}
