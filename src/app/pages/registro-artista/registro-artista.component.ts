import { Component } from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-registro-artista',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './registro-artista.component.html',
  standalone: true,
  styleUrl: './registro-artista.component.css'
})
export class RegistroArtistaComponent {
  registroArtistaForm: FormGroup; // Declaración única
  loading: boolean = false;

  constructor(private fb: FormBuilder) {
    this.registroArtistaForm = this.fb.group({
      usuarioId: ['', [Validators.required]],
      nombrePromotor: ['', [Validators.required, Validators.maxLength(100)]],
      biografia: [''],
      music_url: [''],
      imagenPerfil: ['']
    });
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.registroArtistaForm.get(controlName);
    return control ? control.hasError(errorCode) && control.touched : false;
  }

  onSubmit() {
    console.log(this.registroArtistaForm.get('usuarioId')); // Depuración del control usuarioId
    if (this.registroArtistaForm.valid) {
      this.loading = true;
      const formData = this.registroArtistaForm.value;
      console.log('Formulario enviado:', formData);
      this.loading = false;
    } else {
      console.log('Formulario inválido');
    }
  }
}
