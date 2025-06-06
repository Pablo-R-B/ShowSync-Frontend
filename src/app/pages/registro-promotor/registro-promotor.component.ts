import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {TokenPayload} from '../../interfaces/TokenPayload';
import {jwtDecode} from 'jwt-decode';
import {AuthService} from '../../servicios/auth.service';
import {PromotoresService} from '../../servicios/promotores.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-registro-promotor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    FormsModule,
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './registro-promotor.component.html',
  styleUrl: './registro-promotor.component.css'
})
export class RegistroPromotorComponent implements OnInit{
  registroPromotorForm: FormGroup;
  loading: boolean = false;
  perfilCompleto: boolean = false;
  successMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private promotorService: PromotoresService,
              private router: Router,) {
    this.registroPromotorForm = this.fb.group({
      nombrePromotor: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      imagenPerfil: ['']
    });
  }

  ngOnInit() {
    const token = this.authService.getToken();
    if (token) {
      const decoded: TokenPayload = jwtDecode(token);
      this.perfilCompleto = decoded?.perfilCompleto || false;
    }

    const idUsuario = Number(localStorage.getItem('userId'));

    if (this.perfilCompleto) {
      this.promotorService.getPromotorPorIdUsuario(idUsuario).subscribe(promotor => {
        this.registroPromotorForm.patchValue(promotor);
        localStorage.setItem('promotorId', promotor.id.toString());
      });
    }
  }





  hasError(controlName: string, errorCode: string): boolean {
    const control = this.registroPromotorForm.get(controlName);
    return control ? control.hasError(errorCode) && control.touched : false;
  }

  onSubmit() {
    if (this.registroPromotorForm.valid) {
      this.loading = true;
      const formData = this.registroPromotorForm.value;
      const usuarioId = Number(localStorage.getItem('userId'));

      this.promotorService.guardarPerfilPromotor(usuarioId, formData).subscribe({
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
}
