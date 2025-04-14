import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {RegistroService} from '../../servicios/registro.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf
  ]
})
export class RegistroComponent {

  registroForm: FormGroup;
  mensaje: string = '';
  error: boolean = false;

  constructor(
    private registroService: RegistroService,
    private fb: FormBuilder
  ) {
    this.registroForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      fechaNacimiento: ['', Validators.required],
      rol: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.mensaje = 'Por favor, completa todos los campos correctamente.';
      this.error = true;
      return;
    }

    const datos = {
      ...this.registroForm.value,
      fechaNacimiento: this.registroForm.value.fechaNacimiento, // Asegurar formato correcto si hace falta
      rol: this.registroForm.value.rol.toUpperCase() // Convertimos el rol a mayúsculas
    };

    this.registroService.registrar(datos).subscribe({
      next: (respuesta) => {
        this.mensaje = respuesta;
        this.error = false;
        this.registroForm.reset();
      },
      error: (err) => {
        this.mensaje = err.error;
        this.error = true;
      }
    });
  }
}
