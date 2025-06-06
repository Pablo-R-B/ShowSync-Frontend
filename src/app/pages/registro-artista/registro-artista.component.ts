import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ArtistasService} from '../../servicios/artistas.service';
import {AuthService} from '../../servicios/auth.service';
import {TokenPayload} from '../../interfaces/TokenPayload';
import {jwtDecode} from 'jwt-decode';
import {Router} from '@angular/router';
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {GeneroMusical} from '../../interfaces/GeneroMusical';
import {FileUploadModule} from 'primeng/fileupload';


@Component({
  selector: 'app-registro-artista',
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    FileUploadModule
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







  constructor(private fb: FormBuilder, private artistaService: ArtistasService, private authService: AuthService,
              protected router: Router, private generosService: GenerosMusicalesService) {
    this.registroArtistaForm = this.fb.group({
      nombreArtista: ['', [Validators.required, Validators.maxLength(100)]],
      biografia: [''],
      musicUrl: [''],
      imagenPerfil: [''],
      generosMusicales: this.fb.array([], Validators.required)
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
            imagenPerfil: artista.imagenPerfil // si necesitas enviarla aunque no se vea
          });

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
        });
      });
    }
  }


  hasError(controlName: string, errorCode: string): boolean {
    const control = this.registroArtistaForm.get(controlName);
    return control ? control.hasError(errorCode) && control.touched : false;
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

      if (this.imagenSeleccionada) {
        formData.append('imagenArchivo', this.imagenSeleccionada);
      }

      this.artistaService.guardarPerfilArtista(usuarioId, formData).subscribe({
        next: (response) => {
          this.successMessage = response.mensaje;
          this.loading = false;
          if (this.esEdicion) {
            alert('Perfil actualizado correctamente');
            this.router.navigate(['/perfil']);
          } else {
            localStorage.clear();
            this.router.navigate(['/auth/login']);
          }
        },
        error: (error) => {
          console.error('Error al enviar perfil:', error);
          this.loading = false;
        }
      });
    } else {
      this.registroArtistaForm.markAllAsTouched();
      console.log('Formulario inválido');
    }
  }

  onCheckboxChange(event: any) {
    const formArray: FormArray = this.registroArtistaForm.get('generosMusicales') as FormArray;
    const value = +event.target.value; // Convertimos a number para consistencia

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

}
