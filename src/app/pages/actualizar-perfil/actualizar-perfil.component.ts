import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {RouterModule, Router} from '@angular/router';
import {AuthService} from '../../servicios/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-actualizar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule],
  templateUrl: './actualizar-perfil.component.html',
  styleUrls: ['./actualizar-perfil.component.css'],
})
export class ActualizarPerfilComponent {
  perfilForm: FormGroup;
  mensaje: string = '';
  esEdicion: boolean = true;
  username: string = '';
  email: string = '';

  private userSub!: Subscription;


  constructor(
    private fb: FormBuilder,
    public router: Router,
    private perfilService: AuthService,
  ) {
    this.perfilForm = this.fb.group({
      nuevoNombreUsuario: [''],
      nuevaContrasena: [''],
      repetirContrasena: [''],
      nuevoEmail: [''],
      repetirEmail: [''],
    });
  }


  ngOnInit(): void {
    // Obtener datos iniciales del localStorage
    this.username = localStorage.getItem('username') || '';

    // Suscribirse a cambios en los datos del usuario
    this.userSub = this.perfilService.userData$.subscribe(userData => {
      if (userData) {
        this.username = userData.username;
        // Si necesitas el email, podrías obtenerlo de otra forma o añadirlo al userData
      }
    });

    // Opcional: Obtener el email actual si no está en el localStorage
    // Podrías hacer una llamada al backend para obtener el email actual
    this.getCurrentEmail();
  }

  getCurrentEmail(): void {
    // Implementa este método según cómo obtengas el email actual
    // Por ejemplo:
    this.perfilService.getPerfil().subscribe({
      next: (profile) => {
        this.email = profile.email; // Ajusta según la estructura de tu respuesta
      },
      error: (err) => {
        console.error('Error al obtener el perfil:', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  // Método para verificar si algún campo ha sido modificado
  get hasChanges(): boolean {
    const values = this.perfilForm.value;
    return (
      (values.nuevoNombreUsuario && values.nuevoNombreUsuario.trim() !== '') ||
      (values.nuevaContrasena && values.nuevaContrasena.trim() !== '') ||
      (values.repetirContrasena && values.repetirContrasena.trim() !== '') ||
      (values.nuevoEmail && values.nuevoEmail.trim() !== '') ||
      (values.repetirEmail && values.repetirEmail.trim() !== '')
    );
  }

  onSubmit(): void {
    const { nuevaContrasena, repetirContrasena, nuevoEmail, repetirEmail } = this.perfilForm.value;

    if (nuevaContrasena && nuevaContrasena !== repetirContrasena) {
      this.mensaje = 'Las contraseñas no coinciden.';
      return;
    }

    if (nuevoEmail && nuevoEmail !== repetirEmail) {
      this.mensaje = 'Los correos electrónicos no coinciden.';
      return;
    }

    const datos = {
      nuevoNombreUsuario: this.perfilForm.value.nuevoNombreUsuario || null,
      nuevaContrasena: nuevaContrasena || null,
      nuevoEmail: nuevoEmail || null,
    };

    this.perfilService.updateProfile(datos).subscribe({
      next: (response) => {
        this.mensaje = 'Perfil actualizado correctamente';
        // El header se actualizará automáticamente gracias a la suscripción
      },
      error: (err) => {
        this.mensaje = 'Error al actualizar el perfil';
      }
    });
  }

  // Método alternativo para navegar (opcional)
  salir(): void {
    const rol = this.perfilService.userRole;

    if (rol === 'ARTISTA') {
      this.router.navigate(['/admin-artista']);
    } else if (rol === 'PROMOTOR') {
      this.router.navigate(['/perfil-promotores']);
    } else if (rol === 'ADMINISTRADOR') {
      this.router.navigate(['/admin/resumen']);
    } else {
      console.warn('Rol desconocido:', rol);
      this.router.navigate(['/']); // Ruta por defecto
    }
  }

}
