import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroService } from '../../servicios/registro.service';
import { NgClass, NgIf } from '@angular/common';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgClass,
    NgIf,
    RouterLink,

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
  submitted = false;


  constructor(
    private registroService: RegistroService,
    private fb: FormBuilder,
    protected router: Router
  ) {
    this.registroForm = this.fb.group({
      nombreUsuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@]+@[^@]+\.[a-zA-Z]{2,}$/)]],
      fechaNacimiento: ['', [Validators.required]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      repetirContrasena: ['', [Validators.required]],
      rol: ['', [Validators.required]],
      terminos: [false, [Validators.requiredTrue]]
    }, { updateOn: 'change' , validator: this.compararContrasenas});
  }



  onSubmit() {
    this.submitted = true;

    // Marca todos los controles como tocados para disparar la validación
    this.registroForm.markAllAsTouched();

    // Verifica si el formulario es inválido
    if (this.registroForm.invalid) {
      console.error('Quizás tengas que revisar los campos como aceptar los términos.');
      this.mensaje = 'Revisa los campos. ¿Has aceptado los términos de uso?';
      this.error = true;
      return;
    }
    // Si el formulario es válido, sigue con la lógica de registro
    this.loading = true;
    this.mensaje = '';
    this.error = false;

    // Deshabilita el formulario mientras se carga
    this.registroForm.disable();

    const datos = {
      ...this.registroForm.value,
      fechaNacimiento: this.registroForm.value.fechaNacimiento,
      rol: this.registroForm.value.rol.toUpperCase()
    };

    this.registroService.registrar(datos).subscribe({
      next: (respuesta) => {
        this.mensaje = 'Registro exitoso';
        this.error = false;
        this.registroForm.reset();
        this.correoEnviado = true;
        this.startCountdown();
        this.registroForm.enable();
      },
      error: (err) => {
        console.error(err);
        this.mensaje = err.error || 'Ocurrió un error inesperado. Intenta más tarde.';
        this.error = true;
        this.loading = false;
        this.registroForm.enable();
      }
    });

    console.log('Formulario enviado.');
  }


  startCountdown() {
    this.progreso = 0;
    this.contador = 5;
    const totalDuration = 5000; // 5000ms = 5 seconds

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
