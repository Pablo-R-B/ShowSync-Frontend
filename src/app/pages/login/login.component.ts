import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../servicios/auth.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {jwtDecode} from 'jwt-decode';
import {TokenPayload} from '../../interfaces/TokenPayload';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    FormsModule,
    NgIf,
    RouterLink
  ],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  contrasena: string = '';
  error: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.email, this.contrasena).subscribe({
      next: (token) => {
        localStorage.setItem('token', token);

        // Decodificar el token y redirigir según el rol
        const decoded: TokenPayload = jwtDecode(token);
        console.log('Rol del usuario:', decoded.rol);

        localStorage.setItem('username', decoded.nombre);

        switch (decoded.rol) {
          case 'ADMINISTRADOR':
            this.router.navigate(['admin/salas']);
            break;
          case 'PROMOTOR':
            this.router.navigate(['/promotor']);
            break;
          case 'ARTISTA':
            this.router.navigate(['/artista']);
            break;
          default:
            this.router.navigate(['/home']); // O una ruta por defecto
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Correo o contraseña incorrectos';
      }
    });
  }
}
