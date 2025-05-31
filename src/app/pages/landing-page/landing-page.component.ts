import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {NavigationEnd, Router, RouterLink} from "@angular/router";
import { Evento } from '../../interfaces/Evento';
import { EventosService } from '../../servicios/eventos.service';
import {Component, ElementRef, OnInit, ViewChild,} from '@angular/core';
import {AuthService} from '../../servicios/auth.service';
import { ArtistasService } from '../../servicios/artistas.service';
import { SalasService } from '../../servicios/salas.service';
import { PromotoresService } from '../../servicios/promotores.service';



@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})

export class LandingPageComponent implements OnInit {
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;
  eventos: Evento[] = [];
  usuarioLogueado: boolean = false;
  sala: any;
  artista: any;
  promotor: any;



  constructor(
    private eventosService: EventosService,
    private authService: AuthService, // Inyección del servicio AuthService
    private router: Router,
    private artistasService: ArtistasService,
    private salasService: SalasService,
    private promotoresService: PromotoresService


) {}

  ngOnInit(): void {
    // Verifica si el usuario está logueado
    this.usuarioLogueado = this.authService.isLoggedIn();

    // Carga los eventos confirmados
    this.eventosService.getEventosConfirmados().subscribe(data => {
      this.eventos = data;
    });

    // Cargar datos de sala
    this.salasService.obtenerTodas().subscribe((data: any[]) => {
      this.sala = data[0]; // Asignar la primera sala
    });

    // Cargar datos de artista
    this.artistasService.obtenerImagenesDeTodosLosArtistas().subscribe((data: string[]) => {
      if (data && data.length > 0) {
        this.artista = { imagenPerfil: data[0], nombreArtista: 'Nombre del Artista' }; // Asignar la primera imagen y un nombre
      } else {
        console.warn('No se encontraron imágenes de artistas.');
      }
    });

    // Cargar datos de promotor
    this.promotoresService.listarPromotores().subscribe((data: any[]) => {
      this.promotor = data[0]; // Asignar el primer promotor
    });


    // Ajusta el volumen del video
    setTimeout(() => {
      if (this.heroVideo && this.heroVideo.nativeElement) {
        this.heroVideo.nativeElement.volume = 0.02; // Volumen al 4%
      }
    }, 100);

    // Reproduce el video al volver a la landing
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && event.url === '/') {
        setTimeout(() => {
          if (this.heroVideo && this.heroVideo.nativeElement) {
            this.heroVideo.nativeElement.play().catch(error => {
              console.warn('Autoplay bloqueado:', error);
            });
          }
        }, 100);
      }
    });
  }


  verDetallesEvento(id: number): void {
    if (!id) return;

    if (!this.usuarioLogueado) {
      this.mostrarAdvertencia();
      return;
    }

    // Aquí rediriges a los detalles del evento solo si el usuario está logueado
    this.router.navigate([`/eventos/${id}`]);
  }

  mostrarAdvertencia(): void {
    alert('Debes iniciar sesión para ver los detalles del evento.');
  }

  // Para la animación del carrusel
  onMouseEnter() {
    const carousel = document.querySelector('.carousel-container');
    if (carousel instanceof HTMLElement) {
      carousel.style.transition = 'all 0.2s ease-in-out';
    }
  }

  onMouseLeave() {
    const carousel = document.querySelector('.carousel-container');
    if (carousel instanceof HTMLElement) {
      carousel.style.transition = 'all 0.2s ease-out';
    }
  }
}
