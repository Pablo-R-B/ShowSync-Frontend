import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { TokenPayload } from '../../interfaces/TokenPayload';
import { jwtDecode } from 'jwt-decode';

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
export class LoginComponent implements OnInit {
  email: string = '';
  contrasena: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si ya hay un token válido
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      try {
        const decoded: TokenPayload = jwtDecode(existingToken);
        // Si el token no ha expirado, redirigir según el rol
        if (decoded.exp * 1000 > Date.now()) {
          this.redirectByRole(decoded.rol);
        }
      } catch (error) {
        // Token inválido, limpiarlo
        localStorage.removeItem('token');
      }
    }
  }

  onLogin(): void {
    if (!this.email || !this.contrasena) {
      this.error = 'Por favor, completa todos los campos';
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.error = 'Por favor, introduce un email válido';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.login(this.email, this.contrasena).subscribe({
      next: (token) => {
        try {
          // Almacenar token
          localStorage.setItem('token', token);

          // Decodificar token y extraer información
          const decoded: TokenPayload = jwtDecode(token);

          // Almacenar datos del usuario
          this.storeUserData(decoded);

          // Log para debugging (remover en producción)
          console.log('Login exitoso:', {
            rol: decoded.rol,
            nombre: decoded.nombre,
            id: decoded.id
          });

          // Redirigir según el rol
          this.redirectByRole(decoded.rol);

        } catch (error) {
          console.error('Error al procesar el token:', error);
          this.error = 'Error interno. Por favor, inténtalo de nuevo.';
        } finally {
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error de login:', err);

        // Manejo de errores más específico
        if (err.status === 401) {
          this.error = 'Credenciales incorrectas. Verifica tu email y contraseña.';
        } else if (err.status === 403) {
          this.error = 'Cuenta bloqueada o sin permisos.';
        } else if (err.status === 0) {
          this.error = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          this.error = 'Error del servidor. Por favor, inténtalo más tarde.';
        }
      }
    });
  }

  private storeUserData(decoded: TokenPayload): void {
    localStorage.setItem('rol', decoded.rol);
    localStorage.setItem('username', decoded.nombre);
    localStorage.setItem('userId', String(decoded.id));

    // Almacenar timestamp de login para control de sesión
    localStorage.setItem('loginTime', Date.now().toString());
  }

  private redirectByRole(rol: string): void {
    const routes = {
      'ADMINISTRADOR': '/admin/salas',
      'PROMOTOR': '/landing-page',
      'ARTISTA': '/landing-page'
    };

    const decoded: TokenPayload = jwtDecode(localStorage.getItem('token') || '');
    console.log('Perfil completo:', decoded.perfilCompleto);

    if (!decoded.perfilCompleto) {
      this.router.navigate(['/completar-perfil']);
      return;
    }



    const route = routes[rol as keyof typeof routes] || '/landing-page';
    this.router.navigate([route]);
  }

  // Método para limpiar el formulario
  clearForm(): void {
    this.email = '';
    this.contrasena = '';
    this.error = '';
  }

  // Método para mostrar/ocultar contraseña (opcional)
  togglePasswordVisibility(): void {
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    }
  }
}
