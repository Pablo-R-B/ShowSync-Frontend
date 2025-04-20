import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../servicios/auth.service';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    FormsModule,
    NgIf,
    RouterLink
  ],
  standalone: true,
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
        console.log('Token recibido:', token);
        // Guardamos el token en localStorage o donde quieras
        localStorage.setItem('token', token);
        // Redirigimos a otra página, por ejemplo el "home"
        this.router.navigate(['/catalogo-artistas']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Correo o contraseña incorrectos';
      }
    });
  }
}
