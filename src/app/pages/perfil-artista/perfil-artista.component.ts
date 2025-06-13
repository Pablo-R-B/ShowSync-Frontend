import {Component, Input, OnInit} from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../servicios/auth.service';
import {PostulacionEventoService} from '../../servicios/postulacion-evento.service';
import {EventoDTO} from '../../interfaces/EventoDTO';
import {PromotoresService} from '../../servicios/promotores.service';
import {GeneroMusical} from '../../interfaces/GeneroMusical';
import Swal, {SweetAlertIcon} from 'sweetalert2';


@Component({
  selector: 'app-perfil-artista',
  imports: [
    NgIf,
    FormsModule,
    NgForOf,
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
  artistaId!: number;
  imagenExpandida: any;


  constructor(private artistasService:ArtistasService, private route: ActivatedRoute,
              private promotoresService: PromotoresService, private authService: AuthService,
              private postulacionService:PostulacionEventoService,     private routeTo: Router
  ) {
  }

  ngOnInit() {
    const userId = this.authService.userId;
    this.usuarioRol = this.authService.userRole
    this.IdUsuarioDePromotor = this.authService.userId;

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

    const artistaId = Number(this.route.snapshot.paramMap.get('id'));

      if (artistaId) {
        this.artistasService.artistaPorId(artistaId).subscribe(
          data => { this.artista = data; },
          err  => console.error('Error HTTP:', err)
        );
      } else {
        console.error('ID no encontrado en la URL');
      }

    if(this.usuarioRol === 'PROMOTOR'){
      this.cargarEventosPromotor();
    }

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

      this.postulacionService.nuevaSolicitud(this.eventoSeleccionado, this.artistaId).subscribe({
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
              this.mostrarToast('error', `Error inesperado (status ${response.status})`);
          }
        },
        error: (err) => {
          const msg = err?.error?.message ?? 'No se pudo enviar la solicitud.';
          this.mostrarToast('error', `Error en la solicitud: ${msg}`);
        }
      });
  }

  volver(): void {
    this.routeTo.navigate(['/catalogo-artistas']);
  }



}
