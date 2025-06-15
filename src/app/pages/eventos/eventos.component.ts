import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgIf } from '@angular/common';
import { EventosService } from '../../servicios/eventos.service';
import { AuthService } from '../../servicios/auth.service';
import { ArtistasService } from '../../servicios/artistas.service';
import { PostulacionEventoService } from '../../servicios/postulacion-evento.service';
import Swal, {SweetAlertIcon} from 'sweetalert2';

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
  idEvento!: number;
  eventoPasado: boolean = false;
  mostrarModal: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  successMessage: string = '';
  showSuccess: boolean = false;

  constructor(
    private eventosService: EventosService,
    protected authService: AuthService,
    private artistasService: ArtistasService,
    private postulacionService: PostulacionEventoService,
    private route: ActivatedRoute,
    private routeTo: Router
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
        // Convertir fecha a objeto Date si no lo es
        this.evento.fechaEvento = new Date(this.evento.fechaEvento);

        // Comparar fechas sin considerar la hora
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaEvento = new Date(this.evento.fechaEvento);
        fechaEvento.setHours(0, 0, 0, 0);

        this.eventoPasado = fechaEvento < hoy;
      },
      (error) => {
        console.error('Error al cargar el evento', error);
      }
    );
  }

  mostrarToast(tipo: 'success' | 'error' | 'warning' | 'info', mensaje: string) {
    const config = {
      success: {
        background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
        icon: 'success',
        iconColor: '#ffffff',
        progressBarColor: 'rgba(255,255,255,0.5)',
        animation: 'fadeInUp 0.5s ease-out',
        backdropFilter: 'blur(10px)'
      },
      error: {
        background: 'linear-gradient(135deg, #F44336, #C62828)',
        icon: 'error',
        iconColor: '#ffffff',
        progressBarColor: 'rgba(255,255,255,0.5)',
        animation: 'fadeInUp 0.5s ease-out',
        backdropFilter: 'blur(10px)'
      },
      warning: {
        background: 'linear-gradient(135deg, #FFC107, #FF8F00)',
        icon: 'warning',
        iconColor: '#ffffff',
        progressBarColor: 'rgba(255,255,255,0.5)',
        animation: 'fadeInUp 0.5s ease-out',
        backdropFilter: 'blur(10px)'
      },
      info: {
        background: 'linear-gradient(135deg, #2196F3, #1565C0)',
        icon: 'info',
        iconColor: '#ffffff',
        progressBarColor: 'rgba(255,255,255,0.5)',
        animation: 'fadeInUp 0.5s ease-out',
        backdropFilter: 'blur(10px)'
      }
    };

    const Toast = Swal.mixin({
      toast: true,
      position: 'center',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      backdrop: false,
      animation: true,
      customClass: {
        container: 'animated-toast-container',
        popup: 'animated-toast',
        title: 'toast-title',
        closeButton: 'toast-close-btn',
        icon: tipo,
        image: 'toast-image',
        input: 'toast-input',
        actions: 'toast-actions',
        confirmButton: 'toast-confirm-btn',
        cancelButton: 'toast-cancel-btn',
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      title: mensaje,
      icon: config[tipo].icon as SweetAlertIcon,
      background: config[tipo].background,
      color: '#ffffff',
      iconColor: config[tipo].iconColor,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster'
      }
    });
  }

  enviarOferta() {
    if (this.authService.userRole === 'ADMINISTRADOR' || this.authService.userRole === 'PROMOTOR') {
      //this.mostrarToast('error', 'Solo los artistas pueden postularse a eventos.');
      // Alternativa con mensaje inline:
      this.errorMessage = 'Solo los artistas pueden postularse a eventos.';
      this.showError = true;
      return;
    }

    if (this.eventoPasado) {
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
        }
      },
      error: (err) => {
        const mensaje = err.error?.message ?? 'Error desconocido';
        this.mostrarToast('error', `Error en la solicitud: ${mensaje}`);
      },
    });
  }

  volver(): void {
      window.history.back();
  }

  abrirModal() {
    this.mostrarModal = true;
    // Detener el scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.mostrarModal = false;
    // Restaurar el scroll del body
    document.body.style.overflow = '';
  }


  private showCustomToast(type: 'success' | 'error', message: string, duration: number = 3000) {
    if (type === 'success') {
      this.successMessage = message;
      this.showSuccess = true;
    } else {
      this.errorMessage = message;
      this.showError = true;
    }

    setTimeout(() => {
      this.hideToast(type);
    }, duration);
  }

  private hideToast(type: 'success' | 'error') {
    if (type === 'success') {
      this.showSuccess = false;
    } else {
      this.showError = false;
    }
  }
}
