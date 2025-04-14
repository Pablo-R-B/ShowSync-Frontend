import { Component } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { RegistroService } from '../../servicios/registro.service';
import {NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    NgIf
  ]
})
export class RegistroComponent {

  registroForm: FormGroup;
  mensaje: string = '';
  error: boolean = false;
  loading: boolean = false; // Para manejar el estado de carga
  correoEnviado: boolean = false; // Para controlar si se ha enviado el correo



  constructor(
    private registroService: RegistroService,
    private fb: FormBuilder
  ) {
    this.registroForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      repetirContrasena: ['', [Validators.required]],
      fechaNacimiento: ['', Validators.required],
      rol: ['', Validators.required],
      terminos: [false, Validators.requiredTrue],
    }, { validator: this.compararContrasenas });  // Aquí se aplica el validador para las contraseñas
  }





  onSubmit() {
    this.registroForm.markAllAsTouched();

    if (this.registroForm.invalid) {
      console.error('Debes aceptar los términos y condiciones.');
      this.mensaje = '¿Has aceptado los términos y condiciones?';
      this.error = true;
      return;
    }

    this.loading = true; // Opcional: si quieres bloquear la UI mientras registra

    const datos = {
      ...this.registroForm.value,
      fechaNacimiento: this.registroForm.value.fechaNacimiento,
      rol: this.registroForm.value.rol.toUpperCase()
    };

    this.registroService.registrar(datos).subscribe({
      next: (respuesta) => {
        this.mensaje = respuesta;
        this.error = false;
        this.registroForm.reset();
        this.correoEnviado = true;  // Aquí mostramos el aviso
        this.loading = false;       // Fin del loading
      },
      error: (err) => {
        this.mensaje = err.error;
        this.error = true;
        this.loading = false;       // Fin del loading también en error
      }
    });

    console.log('Formulario enviado.');
  }



  compararContrasenas(group: AbstractControl) {
    const password = group.get('contrasena');
    const confirmPassword = group.get('repetirContrasena');

    if (password && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ mustMatch: true });
      } else {
        if (confirmPassword.hasError('mustMatch')) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }




}
