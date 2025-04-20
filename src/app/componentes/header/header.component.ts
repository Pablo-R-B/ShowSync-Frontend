import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {NgIf, NgOptimizedImage} from '@angular/common';

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
  estaLogueado = !!localStorage.getItem('token');  // Puedes mejorar esto con un servicio
  mostrarMenuPerfil = false;

  constructor(private router: Router) {}

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleMenuPerfil() {
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    this.estaLogueado = false;
    this.mostrarMenuPerfil = false;
    this.menuAbierto = false; // 👈 Cierra el menú hamburguesa
    this.router.navigate(['/auth/login']);
  }

}
