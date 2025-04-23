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
    this.router.navigate(['/auth/login']);
  }
}
