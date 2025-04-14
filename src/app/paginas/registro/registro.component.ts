import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroService } from '../../servicios/registro.service';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';

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
  loading: boolean = false;
  correoEnviado: boolean = false;
  progreso: number = 0;
  contador: number = 5;
  timerInterval: any;

  constructor(
    private registroService: RegistroService,
    private fb: FormBuilder,
    protected router: Router
  ) {
    this.registroForm = this.fb.group({
      nombreUsuario: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      repetirContrasena: ['', [Validators.required]],
      fechaNacimiento: ['', Validators.required],
      rol: ['', Validators.required],
      terminos: [false, Validators.requiredTrue],
    }, { validator: this.compararContrasenas });
  }

  onSubmit() {
    this.registroForm.markAllAsTouched();

    if (this.registroForm.invalid) {
      this.mensaje = '¿Has aceptado los términos y condiciones?';
      this.error = true;
      return;
    }

    this.loading = true;
    this.mensaje = '';
    this.error = false;

    // Deshabilita todos los controles del formulario mientras se carga
    this.registroForm.disable();

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
        this.correoEnviado = true;
        this.startCountdown();


        // Habilitar nuevamente el formulario después de la respuesta exitosa
        this.registroForm.enable();
      },
      error: (err) => {
        console.error(err);
        this.mensaje = err.error?.mensaje || 'Ocurrió un error inesperado. Intenta más tarde.';
        this.error = true;
        this.loading = false;

        // Habilita nuevamente el formulario en caso de error también
        this.registroForm.enable();
      }
    });
  }

  startCountdown() {
    this.progreso = 0;
    this.contador = 5;
    const totalDuration = 5000; // 5 segundos

    const startTime = Date.now();
    const endTime = startTime + totalDuration;

    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      this.progreso = Math.min((elapsed / totalDuration) * 100, 100);

      const remainingSeconds = Math.ceil((endTime - now) / 1000);
      this.contador = remainingSeconds > 0 ? remainingSeconds : 0;

      if (now >= endTime) {
        this.finishCountdown();
      }
    }, 100); // Actualiza cada 100ms para suavidad
  }

  finishCountdown() {
    clearInterval(this.timerInterval);
    this.router.navigate(['auth/login']);
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
