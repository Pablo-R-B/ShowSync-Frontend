import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIf, NgOptimizedImage } from '@angular/common';

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
export class HeaderComponent {
  menuAbierto = false;
  estaLogueado = !!localStorage.getItem('token');
  mostrarMenuPerfil = false;
  username = localStorage.getItem('username') || '';

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleMenuPerfil() {
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.estaLogueado = false;
    this.mostrarMenuPerfil = false;
    this.menuAbierto = false;
    this.router.navigate(['/auth/login']).then(() => {
      this.mostrarMenuPerfil = false;
      this.menuAbierto = false;
    });
  }

  getRutaPerfil() {
    const rol = localStorage.getItem('rol');
    this.mostrarMenuPerfil = false;
    this.menuAbierto = false;
    if (rol === 'PROMOTOR') {
      return '/perfil-promotores';
    } if (rol === 'ADMINISTRADOR') {
      return '/admin';
    } else {
      return '/login';
    }
  }

  // Nuevo método para obtener la imagen según el rol
  getImagenUsuario(): string {
    const rol = localStorage.getItem('rol');
    if (rol === 'ADMINISTRADOR') {
      return 'assets/images/user_admin.png';
    }
    // Para otros roles, mantén el ícono SVG actual (no necesitas una imagen)
    return '';
  }

  // Método para verificar si debe mostrar imagen o ícono SVG
  esAdministrador(): boolean {
    return localStorage.getItem('rol') === 'ADMINISTRADOR';
  }
}
