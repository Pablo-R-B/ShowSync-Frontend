import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router, RouterLink, NavigationEnd, ActivatedRoute} from '@angular/router';
import { NgIf, NgOptimizedImage } from '@angular/common';
import { Subscription } from 'rxjs';
import {ArtistasService} from '../../servicios/artistas.service';
import {AuthService} from '../../servicios/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    NgOptimizedImage
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuAbierto = false;
  estaLogueado = false;
  mostrarMenuPerfil = false;
  username = '';
  rolUsuario = '';
  artistaId: number | undefined;
  private routerSubscription?: Subscription;
  usuarioId!: number;

  constructor(private router: Router, private artistaService:ArtistasService, private authService:AuthService) {}

  ngOnInit() {
    this.actualizarEstadoUsuario();

    // Suscribirse a cambios de ruta para actualizar el estado
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.actualizarEstadoUsuario();
      }
    });

   // this.artistaService.getArtistaIdPorUsuario(this.authService.userId).subscribe(id => {
   //   this.artistaId = id;
   //   console.log('artistaId obtenido:', this.artistaId);
   // });

  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private actualizarEstadoUsuario() {
    const token = localStorage.getItem('token');
    this.estaLogueado = !!token;
    this.username = localStorage.getItem('username') || '';
    this.rolUsuario = localStorage.getItem('rol') || '';
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleMenuPerfil() {
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
  }

  cerrarSesion() {
    // Limpiar datos del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');

    // Actualizar estado del componente
    this.estaLogueado = false;
    this.username = '';
    this.rolUsuario = '';
    this.mostrarMenuPerfil = false;
    this.menuAbierto = false;

    // Navegar al login
    this.router.navigate(['/auth/login']);
  }

  getRutaPerfil() {
    this.mostrarMenuPerfil = false;
    this.menuAbierto = false;

    switch (this.rolUsuario) {
      case 'PROMOTOR':
        return '/perfil-promotores';
      case 'ADMINISTRADOR':
        return '/admin';
      case 'SALA':
        return '/perfil-salas';
      case 'ARTISTA':
          return `/admin-artista`;

      default:
        return '/auth/login';
    }
  }

  getImagenUsuario(): string {
    switch (this.rolUsuario) {
      case 'ADMINISTRADOR':
        return 'assets/images/user_admin.png';
      case 'PROMOTOR':
        return 'assets/images/user_promotor.png';
      case 'SALA':
        return 'assets/images/user_sala.png';
      case 'ARTISTA':
        return 'assets/images/user_artista.png';
      default:
        return '';
    }
  }

  esAdministrador(): boolean {
    return this.rolUsuario === 'ADMINISTRADOR';
  }

  // Métodos para controlar visibilidad de enlaces específicos
  puedeVerEventos(): boolean {
    return this.estaLogueado;
  }

  puedeVerSalas(): boolean {
    return this.estaLogueado && this.rolUsuario !== 'ARTISTA';
  }

  puedeVerArtistas(): boolean {
    return this.estaLogueado;
  }

  puedeVerPromotores(): boolean {
    return this.estaLogueado;
  }

  // Método para restricciones más específicas por rol
  tieneAccesoA(seccion: string): boolean {
    if (!this.estaLogueado) {
      // Solo páginas públicas para usuarios no logueados
      return ['inicio', 'instrucciones'].includes(seccion);
    }

    // Lógica específica por rol si es necesario
    switch (this.rolUsuario) {
      case 'ADMINISTRADOR':
        return true; // Admin tiene acceso a todo
      case 'PROMOTOR':
        return ['inicio', 'eventos', 'salas', 'artistas', 'instrucciones'].includes(seccion);
      case 'SALA':
        return ['inicio', 'eventos', 'artistas', 'promotores', 'instrucciones'].includes(seccion);
      case 'ARTISTA':
        return ['inicio', 'eventos', 'artistas', 'promotores', 'instrucciones'].includes(seccion);
      default:
        return ['inicio', 'instrucciones'].includes(seccion);
    }
  }
}
