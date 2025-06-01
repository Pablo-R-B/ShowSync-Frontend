import {Component, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ArtistasService} from '../../servicios/artistas.service';
import {AuthService} from '../../servicios/auth.service';
import {TokenPayload} from '../../interfaces/TokenPayload';
import {jwtDecode} from 'jwt-decode';
import {Router} from '@angular/router';

@Component({
  selector: 'app-registro-artista',
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './registro-artista.component.html',
  standalone: true,
  styleUrl: './registro-artista.component.css'
})
export class RegistroArtistaComponent implements OnInit{
  registroArtistaForm: FormGroup;
  loading: boolean = false;
  perfilCompleto: boolean = false;
  successMessage: string = '';

  constructor(private fb: FormBuilder, private artistaService:ArtistasService, private authService:AuthService,
              private router:Router) {
    this.registroArtistaForm = this.fb.group({
      nombreArtista: ['', [Validators.required, Validators.maxLength(100)]],
      biografia: [''],
      music_url: [''],
      imagenPerfil: [''],
      musicUrl:['']
    });
  }

  ngOnInit(){
    const token = this.authService.getToken();
    if (token) {
      const decoded: TokenPayload = jwtDecode(token);
      this.perfilCompleto = decoded?.perfilCompleto || false;
    }

    const idUsuario = Number(localStorage.getItem('userId'));

    if (this.perfilCompleto) {
      this.artistaService.artistaPorId(idUsuario).subscribe(artista => {
        this.registroArtistaForm.patchValue(artista);
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
      const usuarioId = Number(localStorage.getItem('userId'));

      this.artistaService.guardarPerfilArtista(usuarioId, formData).subscribe({
        next: (response: any) => {
          console.log('Perfil enviado correctamente:', response);
          this.successMessage = response.mensaje;
          this.loading = false;
          this.router.navigate(['/landing-page']);
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
}
