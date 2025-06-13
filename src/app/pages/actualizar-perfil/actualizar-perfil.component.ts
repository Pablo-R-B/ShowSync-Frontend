import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {RouterModule, Router} from '@angular/router';
import {AuthService} from '../../servicios/auth.service';

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
