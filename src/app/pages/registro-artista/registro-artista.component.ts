import {Component, OnInit} from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ArtistasService} from '../../servicios/artistas.service';
import {AuthService} from '../../servicios/auth.service';
import {TokenPayload} from '../../interfaces/TokenPayload';
import {jwtDecode} from 'jwt-decode';
import {Router} from '@angular/router';
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {GeneroMusical} from '../../interfaces/GeneroMusical';
import {FileUploadModule} from 'primeng/fileupload';
import {ToastModule} from 'primeng/toast';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-registro-artista',
  providers: [MessageService],
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    FileUploadModule,
    NgClass,
    ToastModule,
  ],
  templateUrl: './registro-artista.component.html',
  standalone: true,
  styleUrl: './registro-artista.component.css'
})
export class RegistroArtistaComponent implements OnInit {
  registroArtistaForm: FormGroup;
  loading: boolean = false;
  perfilCompleto: boolean = false;
  successMessage: string = '';
  generosMusicales: GeneroMusical[] = [];
  generosSeleccionados: number[] = [];
  esEdicion: boolean = false;
  imagenSeleccionada: File | null = null;
  imagenPreview: string | ArrayBuffer | null = null;

  originalFormValue: any;
  originalImagenPreview: string | ArrayBuffer | null = null;

  isOpen = false;
  cuentaAtrasModal = 5;
  private modalCerradoCallback: (() => void) | null = null;

  constructor(private fb: FormBuilder, private artistaService: ArtistasService, private authService: AuthService,
              protected router: Router, private generosService: GenerosMusicalesService, private messageService: MessageService
  ) {
    this.registroArtistaForm = this.fb.group({
      nombreArtista: ['', [Validators.required, Validators.maxLength(100)]],
      biografia: ['', [Validators.required, Validators.maxLength(500)]],
      musicUrl: ['', [Validators.pattern('https?://.+')]],
      imagenPerfil: [''],
      generosMusicales: this.fb.array([], Validators.required),
    });
  }

  ngOnInit() {
    this.generosService.listarGeneros().subscribe(generos => {
      this.generosMusicales = generos;
    });

    const token = this.authService.getToken();
    if (token) {
      const decoded: TokenPayload = jwtDecode(token);
      this.perfilCompleto = decoded?.perfilCompleto || false;
      this.esEdicion = this.perfilCompleto;
    }

    const idUsuario = Number(localStorage.getItem('userId'));
    if (this.perfilCompleto && idUsuario) {
      this.artistaService.getArtistaIdPorUsuario(idUsuario).subscribe(artistaId => {
        this.artistaService.artistaPorId(artistaId).subscribe(artista => {
          // Rellenar campos directamente
          this.registroArtistaForm.patchValue({
            nombreArtista: artista.nombreArtista,
            biografia: artista.biografia,
            musicUrl: artista.musicUrl,
            imagenPerfil: artista.imagenPerfil
          });

          // Guardar valores originales para comparación
          this.originalFormValue = this.registroArtistaForm.getRawValue();
          this.originalImagenPreview = artista.imagenPerfil;

          // Mostrar vista previa si ya hay imagen
          if (artista.imagenPerfil) {
            this.imagenPreview = artista.imagenPerfil;
          }

          // Manejar géneros musicales
          type GeneroMusicalInput = string | GeneroMusical;
          const selectedGeneroIds = artista.generosMusicales.map((g: GeneroMusicalInput) =>
            typeof g === 'string' ? +g : g.id
          );

          const formArray = this.fb.array([]);
          selectedGeneroIds.forEach(id => formArray.push(this.fb.control(id)));
          this.registroArtistaForm.setControl('generosMusicales', formArray);

          // Actualizar valor original después de cargar géneros
          this.originalFormValue = this.registroArtistaForm.getRawValue();
        });
      });
    }
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.registroArtistaForm.get(controlName);
    return control ? control.hasError(errorCode) && control.touched : false;
  }

  abrirModalConCallback(callback: () => void) {
    this.isOpen = true;
    this.modalCerradoCallback = callback;
    this.startCountdown();
  }

  closeModal() {
    this.isOpen = false;
    this.cuentaAtrasModal = 5;

    if (this.modalCerradoCallback) {
      this.modalCerradoCallback();
      this.modalCerradoCallback = null;
    }
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.cuentaAtrasModal--;
      if (this.cuentaAtrasModal <= 0) {
        clearInterval(interval);
        this.closeModal();
      }
    }, 1000);
  }

  onSubmit() {
    if (this.registroArtistaForm.valid) {
      this.loading = true;

      const usuarioId = Number(localStorage.getItem('userId'));

      const formData = new FormData();
      const artistaPayload = {
        nombreArtista: this.registroArtistaForm.value.nombreArtista,
        biografia: this.registroArtistaForm.value.biografia,
        musicUrl: this.registroArtistaForm.value.musicUrl,
        generosMusicales: this.registroArtistaForm.value.generosMusicales.map((id: number) => ({ id }))
      };

      formData.append('artista', new Blob([JSON.stringify(artistaPayload)], { type: 'application/json' }));

      if (!this.imagenSeleccionada && this.imagenPreview && typeof this.imagenPreview === 'string') {
        (artistaPayload as any)['imagenPerfil'] = this.imagenPreview;
      }

      formData.append('artista', new Blob([JSON.stringify(artistaPayload)], { type: 'application/json' }));

      if (this.imagenSeleccionada) {
        formData.append('imagenArchivo', this.imagenSeleccionada);
      }

      this.artistaService.guardarPerfilArtista(usuarioId, formData).subscribe({
        next: (response) => {
          this.loading = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.mensaje || 'Perfil guardado correctamente',
            life: 3000,
          });

          if (this.esEdicion) {
            setTimeout(() => this.router.navigate(['/perfil']), 3000);
          } else {
            this.abrirModalConCallback(() => {
              localStorage.clear();
              this.router.navigate(['/auth/login']);
            });
          }
        },
        error: (error) => {
          this.loading = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.mensaje || 'Hubo un problema al guardar el perfil',
            life: 4000,
          });
        }
      });

    } else {
      this.registroArtistaForm.markAllAsTouched();
      console.log('Formulario inválido');
    }
  }

  onCheckboxChange(event: any) {
    const formArray: FormArray = this.registroArtistaForm.get('generosMusicales') as FormArray;
    const value = +event.target.value;

    if (event.target.checked) {
      if (!formArray.value.includes(value)) {
        formArray.push(this.fb.control(value));
      }
    } else {
      const index = formArray.controls.findIndex(x => +x.value === value);
      if (index !== -1) {
        formArray.removeAt(index);
      }
    }
  }

  subirImagen(event: any): void {
    const archivo = event.files?.[0];
    if (archivo) {
      this.imagenSeleccionada = archivo;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(archivo);
    }
  }

  // Método para verificar si el formulario ha sido modificado
  get hasChanges(): boolean {
    if (!this.originalFormValue) return false;

    // Comparar valores del formulario
    const currentFormValue = this.registroArtistaForm.getRawValue();
    const formChanged = JSON.stringify(currentFormValue) !== JSON.stringify(this.originalFormValue);

    // Comparar imagen
    const imageChanged = this.imagenPreview !== this.originalImagenPreview || this.imagenSeleccionada !== null;

    return formChanged || imageChanged;
  }

  // Método para verificar si el formulario está completo y válido
  get isFormCompleteAndValid(): boolean {
    if (this.registroArtistaForm.invalid) return false;

    const { nombreArtista, biografia, musicUrl, generosMusicales } = this.registroArtistaForm.value;

    // Verificar campos obligatorios
    const hasRequiredFields = nombreArtista?.trim() &&
      biografia?.trim() &&
      musicUrl?.trim() &&
      generosMusicales?.length > 0;

    if (!hasRequiredFields) return false;

    // Para nuevos registros, requiere imagen
    if (!this.perfilCompleto) {
      return this.imagenSeleccionada !== null || this.imagenPreview !== null;
    }

    return true;
  }

  // Método principal para determinar si se puede guardar
  get canSave(): boolean {
    if (this.loading) return false;
    if (!this.isFormCompleteAndValid) return false;

    // En modo edición, solo permitir guardar si hay cambios
    if (this.perfilCompleto) {
      return this.hasChanges;
    }

    // En modo registro, permitir guardar si está completo
    return true;
  }

  // Método heredado para compatibilidad (puedes eliminarlo gradualmente)
  formularioModificado(): boolean {
    return this.hasChanges;
  }

  // Método heredado para compatibilidad (puedes eliminarlo gradualmente)
  puedeGuardar(): boolean {
    return this.canSave;
  }
}
