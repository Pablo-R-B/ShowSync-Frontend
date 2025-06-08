import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgIf, NgClass } from "@angular/common";
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../servicios/auth.service';
import { PromotoresService } from '../../servicios/promotores.service';
import { Router } from '@angular/router';
import { FileUploadModule } from 'primeng/fileupload';
import { TokenPayload } from '../../interfaces/TokenPayload';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-registro-promotor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgClass,
    FileUploadModule,
    ToastModule

  ],
  providers: [MessageService],
  templateUrl: './registro-promotor.component.html',
  styleUrl: './registro-promotor.component.css'
})
export class RegistroPromotorComponent implements OnInit {
  registroPromotorForm: FormGroup;
  loading = false;
  perfilCompleto = false;
  successMessage = '';
  imagenPreview: string | ArrayBuffer | null = null;
  imagenArchivo: File | null = null;
  isOpen = false;
  cuentaAtrasModal = 5;
  private modalCerradoCallback: (() => void) | null = null;




  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private promotorService: PromotoresService,
    protected router: Router,
    private messageService: MessageService

  ) {
    this.registroPromotorForm = this.fb.group({
      nombrePromotor: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]]});
  }

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      const decoded: TokenPayload = jwtDecode(token);
      this.perfilCompleto = decoded?.perfilCompleto || false;
    }

    if (this.perfilCompleto) {
      const idUsuario = Number(localStorage.getItem('userId'));
      this.promotorService.getPromotorPorIdUsuario(idUsuario).subscribe(promotor => {
        this.registroPromotorForm.patchValue(promotor);
        localStorage.setItem('promotorId', promotor.id.toString());
        if (promotor.imagenPerfil) {
          this.imagenPreview = promotor.imagenPerfil;
        }
      });
    }
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.registroPromotorForm.get(controlName);
    return control ? control.hasError(errorCode) && control.touched : false;
  }

  esFormularioTocado(): boolean {
    return Object.values(this.registroPromotorForm.controls).some(control => control.touched);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imagenArchivo = input.files[0];

      const reader = new FileReader();
      reader.onload = () => this.imagenPreview = reader.result;
      reader.readAsDataURL(this.imagenArchivo);
    }
  }

  abrirModalConCallback(callback: () => void) {
    this.isOpen = true;
    this.modalCerradoCallback = callback;
    this.startCountdown(); // cuenta regresiva de cierre automático
  }

  closeModal() {
    this.isOpen = false;
    this.cuentaAtrasModal = 5;

    if (this.modalCerradoCallback) {
      this.modalCerradoCallback(); // ejecutar la acción pendiente
      this.modalCerradoCallback = null;
    }
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.cuentaAtrasModal--;
      if (this.cuentaAtrasModal <= 0) {
        clearInterval(interval);
        this.closeModal(); // cierra modal automáticamente
      }
    }, 1000);
  }


  onSubmit() {
    if (!this.registroPromotorForm.valid) {
      this.markAllAsTouched();
      this.messageService.add({severity:'warn', summary:'Formulario inválido', detail:'Por favor completa todos los campos obligatorios.'});
      return;
    }

    if (!this.perfilCompleto && !this.imagenArchivo) {
      this.messageService.add({severity:'warn', summary:'Imagen requerida', detail:'La imagen de perfil es obligatoria para registrarse.'});
      return;
    }

    this.loading = true;
    const usuarioId = Number(localStorage.getItem('userId'));
    if (this.registroPromotorForm.get('descripcion')?.value?.length > 500) {
      this.messageService.add({severity: 'error', summary: 'Error', detail: 'La descripción no puede superar los 255 caracteres.'});
      return;
    }
    const promotor = {
      nombrePromotor: this.registroPromotorForm.get('nombrePromotor')?.value,
      descripcion: this.registroPromotorForm.get('descripcion')?.value,
      imagenPerfil: '' // lo procesa el backend
    };

    const formData = new FormData();
    formData.append('promotor', new Blob([JSON.stringify(promotor)], { type: 'application/json' }));
    if (this.imagenArchivo) {
      formData.append('imagenArchivo', this.imagenArchivo);
    }

    this.promotorService.guardarPerfilPromotor(usuarioId, formData).subscribe({
      next: (res) => {
        this.loading = false;
        const msg = this.perfilCompleto ? 'Cambios guardados correctamente.' : res.mensaje || 'Registro exitoso.';
        this.messageService.add({severity:'success', summary:'Éxito', detail: msg});

        if (!this.perfilCompleto) {
          this.abrirModalConCallback(() => {
            localStorage.clear();
            this.router.navigate(['/auth/login']);
          });
        }
      },
      error: (err) => {
        console.error('Error al enviar perfil:', err);
        this.loading = false;
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'La descripción no puede superar los 500 caracteres.'});      }
    });
  }


  formularioModificado(): boolean {
    return this.registroPromotorForm.dirty || !!this.imagenArchivo;
  }

  private markAllAsTouched() {
    Object.values(this.registroPromotorForm.controls).forEach(control => control.markAsTouched());
  }



}
