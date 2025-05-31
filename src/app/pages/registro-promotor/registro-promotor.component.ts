import { Component } from '@angular/core';
// import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
// import {NgIf} from "@angular/common";
//
@Component({
  selector: 'app-registro-promotor',
  standalone: true,
    imports: [
//         FormsModule,
//         NgIf,
//         ReactiveFormsModule
    ],
  templateUrl: './registro-promotor.component.html',
  styleUrl: './registro-promotor.component.css'
})
export class RegistroPromotorComponent {
//   registroPromotorForm: FormGroup; // Declaración única
//   loading: boolean = false;
//
//   constructor(private fb: FormBuilder) {
//     this.registroPromotorForm = this.fb.group({
//       usuarioId: ['', [Validators.required]],
//       nombrePromotor: ['', [Validators.required, Validators.maxLength(100)]],
//       descripcion: [''],
//       imagenPerfil: ['']
//     });
//   }
//
//   hasError(controlName: string, errorCode: string): boolean {
//     const control = this.registroPromotorForm.get(controlName);
//     return control ? control.hasError(errorCode) && control.touched : false;
//   }
//
//   onSubmit() {
//     console.log(this.registroPromotorForm.get('usuarioId')); // Depuración del control usuarioId
//     if (this.registroPromotorForm.valid) {
//       this.loading = true;
//       const formData = this.registroPromotorForm.value;
//       console.log('Formulario enviado:', formData);
//       this.loading = false;
//     } else {
//       console.log('Formulario inválido');
//     }
//   }
}
