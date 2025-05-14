import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterLink} from "@angular/router";
import { Evento } from '../../interfaces/Evento';
import { EventosService } from '../../servicios/EventosService';
import {  Component, OnInit, } from '@angular/core';
import {AuthService} from '../../servicios/auth.service';

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
  eventos: Evento[] = [];
  usuarioLogueado: boolean = false;

  constructor(
    private eventosService: EventosService,
    private authService: AuthService, // Inyección del servicio AuthService
    private router: Router

) {}

  ngOnInit(): void {
    // Verifica si el usuario está logueado usando el servicio AuthService
    this.usuarioLogueado = this.authService.isLoggedIn();

    // Carga los eventos confirmados
    this.eventosService.getEventosConfirmados().subscribe(data => {
      this.eventos = data;
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
