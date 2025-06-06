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

@Component({
  selector: 'app-registro-artista',
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgForOf
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


  constructor(private fb: FormBuilder, private artistaService: ArtistasService, private authService: AuthService,
              private router: Router, private generosService: GenerosMusicalesService) {
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
    }

    const idUsuario = Number(localStorage.getItem('userId'));

    if (this.perfilCompleto && idUsuario) {
      this.artistaService.getArtistaIdPorUsuario(idUsuario).subscribe(artistaId => {
        this.artistaService.artistaPorId(artistaId).subscribe(artista => {
          this.registroArtistaForm.patchValue({
            nombreArtista: artista.nombreArtista,
            biografia: artista.biografia,
            imagenPerfil: artista.imagenPerfil,
            musicUrl: artista.musicUrl,
          });

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
      const formData = this.registroArtistaForm.value;

      const artistaPayload = {
        nombreArtista: formData.nombreArtista,
        biografia: formData.biografia,
        imagenPerfil: formData.imagenPerfil,
        musicUrl: formData.musicUrl,
        generosMusicales: formData.generosMusicales.map((id: number) => ({ id } as GeneroMusical))

      };


      const usuarioId = Number(localStorage.getItem('userId'));

      this.artistaService.guardarPerfilArtista(usuarioId, artistaPayload).subscribe({
        next: (response: any) => {
          console.log('Perfil enviado correctamente:', response);
          this.successMessage = response.mensaje;
          this.loading = false;
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('rol');
          this.router.navigate(['/auth/login']);
        },
        error: (error) => {
          console.error('Error al enviar perfil:', error);
          this.loading = false;
        }
      });
    } else {
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
}
