import {Component, OnInit} from '@angular/core';
// import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
// import {ArtistasService} from '../../servicios/artistas.service';
// import {AuthService} from '../../servicios/auth.service';
// import {TokenPayload} from '../../interfaces/TokenPayload';
// import {jwtDecode} from 'jwt-decode';
//
@Component({
  selector: 'app-registro-artista',
  imports: [
//     FormsModule,
//     ReactiveFormsModule
  ],
  templateUrl: './registro-artista.component.html',
  standalone: true,
  styleUrl: './registro-artista.component.css'
})
export class RegistroArtistaComponent {
//   registroArtistaForm: FormGroup; // Declaración única
//   loading: boolean = false;
//   perfilCompleto: boolean = false;
//
//   constructor(private fb: FormBuilder, private artistaService:ArtistasService, private authService:AuthService) {
//     this.registroArtistaForm = this.fb.group({
//       nombreArtista: ['', [Validators.required, Validators.maxLength(100)]],
//       biografia: [''],
//       music_url: [''],
//       imagenPerfil: ['']
//     });
//   }
//
//   ngOnInit(){
//     // const token = this.authService.getToken();
//     // if (token){
//     //   const decoded: TokenPayload = jwtDecode(token);
//     //   this.perfilCompleto = decoded?.perfilCompleto || false;
//     // }
//     //
//     // const idUsuario=Number(localStorage.getItem('userId'));
//     //
//     // if (this.perfilCompleto) {
//     //   this.artistaService.artistaPorId(idUsuario).subscribe(data => {
//     //     this.registroArtistaForm.patchValue(data); // o registroPromotorForm
//     //   });
//     // }
//
//
//     // this.artistaService.getArtistaIdPorUsuario(idUsuario).subscribe(artistaId => {
//     //   if (artistaId) {
//     //     localStorage.setItem('artistaId', artistaId.toString()); // Guarda el ID en localStorage
//     //
//     //     const formData = this.registroArtistaForm.value;
//     //     this.artistaService.actualizarPerfilArtista({ id: artistaId, ...formData }).subscribe(response => {
//     //       console.log('Perfil actualizado:', response);
//     //     });
//     //   } else {
//     //     console.warn('No se encontró un artista asociado al usuarioId:', idUsuario);
//     //   }
//     // });
//
//   }
//
//   hasError(controlName: string, errorCode: string): boolean {
//     const control = this.registroArtistaForm.get(controlName);
//     return control ? control.hasError(errorCode) && control.touched : false;
//   }
//
//   onSubmit() {
//     if (this.registroArtistaForm.valid) {
//       this.loading = true;
//       const formData = this.registroArtistaForm.value;
//       const perfilCompleto = this.authService.getPerfilCompletoFromToken();
//
//       const request$ = perfilCompleto
//         ? this.artistaService.actualizarPerfilArtista(formData)
//         : this.artistaService.completarPerfilArtista(formData);
//
//       request$.subscribe({
//         next:(response)=>{
//           console.log('Perfil enviado correctamente:', response);
//           this.loading = false;
//         },
//         error: (error) => {
//           console.error('Error al enviar perfil:', error);
//           this.loading = false;
//         }
//       });
//     } else {
//         console.log('Formulario inválido');
//     }
//   }
}
