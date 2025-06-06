import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgIf, NgClass } from "@angular/common";
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../servicios/auth.service';
import { PromotoresService } from '../../servicios/promotores.service';
import { Router } from '@angular/router';
import { FileUploadModule } from 'primeng/fileupload';
import { TokenPayload } from '../../interfaces/TokenPayload';

@Component({
  selector: 'app-registro-promotor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    NgClass,
    FileUploadModule
  ],
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


  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private promotorService: PromotoresService,
    protected router: Router
  ) {
    this.registroPromotorForm = this.fb.group({
      nombrePromotor: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.required],
    });
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

  onSubmit() {
    if (!this.registroPromotorForm.valid) return;

    // Validar imagen solo si es nuevo registro
    if (!this.perfilCompleto && !this.imagenArchivo) {
      return;
    }

    this.loading = true;
    const usuarioId = Number(localStorage.getItem('userId'));
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
        this.successMessage = this.perfilCompleto ? 'Cambios guardados correctamente.' : res.mensaje;
        this.loading = false;

        if (!this.perfilCompleto) {
          localStorage.clear();
          this.router.navigate(['/auth/login']);
        }
      },
      error: (err) => {
        console.error('Error al enviar perfil:', err);
        this.loading = false;
      }
    });
  }


  formularioModificado(): boolean {
    return this.registroPromotorForm.dirty || !!this.imagenArchivo;
  }

}
