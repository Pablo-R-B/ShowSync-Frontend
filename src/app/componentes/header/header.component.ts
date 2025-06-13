import {Component, OnInit, OnDestroy, ElementRef, HostListener} from '@angular/core';
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
  perfilCompleto = false; // Nueva propiedad


  private routerSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(private router: Router,
              private elementRef: ElementRef,
              private authService: AuthService

  ) {}


  ngOnInit() {
    this.actualizarEstadoUsuario();

    // Suscribirse a cambios de ruta
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.actualizarEstadoUsuario();
      }
    });

    // Suscribirse a cambios en los datos del usuario
    this.authSubscription = this.authService.userData$.subscribe(userData => {
      this.actualizarEstadoUsuario();
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private actualizarEstadoUsuario() {
    this.estaLogueado = this.authService.isLoggedIn();
    this.username = localStorage.getItem('username') || '';
    this.rolUsuario = this.authService.userRole;
    this.perfilCompleto = this.authService.getPerfilCompletoFromToken();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  // MÉTODO MODIFICADO: Ahora el menú se abre siempre cuando el usuario está logueado
  toggleMenuPerfil() {
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
    if (this.mostrarMenuPerfil) {
      this.menuAbierto = false; // Asegurarse de cerrar el menú principal si está abierto
    }
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



  @HostListener('document:click', ['$event'])
  onClickFuera(event: Event) {
    const target = event.target as HTMLElement;

    // Buscar el botón del menú perfil
    const botonMenuPerfil = this.elementRef.nativeElement.querySelector('[data-menu-perfil-button]');
    const menuPerfil = this.elementRef.nativeElement.querySelector('[data-menu-perfil]');

    if (this.mostrarMenuPerfil && botonMenuPerfil && menuPerfil) {
      // Solo cerrar si el clic NO fue en el botón NI en el menú
      if (!botonMenuPerfil.contains(target) && !menuPerfil.contains(target)) {
        this.mostrarMenuPerfil = false;
      }
    }
  }


}
