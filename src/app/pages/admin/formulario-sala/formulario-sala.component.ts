import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { SalasService } from '../../../servicios/salas.service';
import { Sala } from '../../../interfaces/sala'; // Importa la interfaz Sala del backend

@Component({
  selector: 'app-formulario-sala',
  templateUrl: './formulario-sala.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    FileUploadModule
  ],
  providers: [MessageService]
})
export class FormularioSalaComponent implements OnInit {
  sala: Partial<Sala> = {
    nombre: '',
    direccion: '',
    capacidad: 0, // Cambiado de null a 0
    ciudad: '',
    provincia: '',
    codigoPostal: '', // Cambiado a coincidir con la interfaz del backend
    descripcion: '',

  };

  editando = false;
  isLoading = false;
  imagenCargando = false;
  maxFileSize = 2; // MB

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salaService: SalasService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarSala(+id);
    }
  }

  cargarSala(id: number): void {
    this.isLoading = true;
    this.editando = true;

    this.salaService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.sala = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener sala:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la sala',
          life: 5000
        });
        this.isLoading = false;
      }
    });
  }

  guardarSala(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    const operacion = this.editando && this.sala.id
      ? this.salaService.editar(this.sala.id, this.sala as Sala)
      : this.salaService.crear(this.sala as Sala);

    operacion.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Sala ${this.editando ? 'actualizada' : 'creada'} correctamente`,
          life: 3000
        });
        this.router.navigate(['/admin/salas']);
      },
      error: (err) => {
        console.error(`Error al ${this.editando ? 'actualizar' : 'crear'} sala:`, err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `No se pudo ${this.editando ? 'actualizar' : 'crear'} la sala`,
          life: 5000
        });
        this.isLoading = false;
      }
    });
  }

  subirImagen(event: any): void {
    const file: File = event.files[0];

    if (!file) return;

    if (!file.type.match('image.*')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Solo se permiten archivos de imagen',
        life: 5000
      });
      return;
    }

    if (file.size > this.maxFileSize * 1024 * 1024) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `El tamaño máximo permitido es ${this.maxFileSize}MB`,
        life: 5000
      });
      return;
    }

    this.imagenCargando = true;

    const lector = new FileReader();
    lector.onload = () => {
      this.sala.logo = lector.result as string;
      this.imagenCargando = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Imagen cargada correctamente',
        life: 3000
      });
    };
    lector.onerror = () => {
      this.imagenCargando = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al leer la imagen',
        life: 5000
      });
    };
    lector.readAsDataURL(file);
  }

  cancelar(): void {
    this.router.navigate(['/admin/salas']);
  }

  get imagenPreview(): string {
    return this.sala.logo || 'assets/images/logo_1.png'; // Ruta por defecto si no hay imagen
  }
}
