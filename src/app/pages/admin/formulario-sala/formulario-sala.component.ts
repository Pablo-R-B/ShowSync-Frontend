import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { SalasService } from '../../../servicios/salas.service';
import { Sala } from '../../../interfaces/sala';
import pica from 'pica';
import { PROVINCIAS_ES } from '../../../interfaces/provincias-es';

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
    capacidad: 0,
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    descripcion: '',
  };

  provincias = PROVINCIAS_ES;
  editando = false;
  isLoading = false;
  imagenCargando = false;
  maxFileSize = 5; // MB
  imagenArchivo?: File;

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

    const maxFileSizeBytes = this.maxFileSize * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Redimensionando',
        detail: `La imagen es muy grande, se intentará redimensionar automáticamente.`,
        life: 5000
      });
    }

    this.imagenCargando = true;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;

      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const maxWidth = 1024;
          const maxHeight = 1024;

          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          const picaInstance = pica();
          await picaInstance.resize(img, canvas);
          const base64 = await picaInstance.toBlob(canvas, file.type);
          const previewReader = new FileReader();

          previewReader.onloadend = () => {
            this.sala.logo = previewReader.result as string;
            this.imagenArchivo = new File([base64], file.name, { type: file.type });
            this.imagenCargando = false;

            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Imagen redimensionada y cargada correctamente',
              life: 3000
            });
          };

          previewReader.readAsDataURL(base64);
        } catch (error) {
          console.error('Error al redimensionar la imagen:', error);
          this.imagenCargando = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo redimensionar la imagen',
            life: 5000
          });
        }
      };

      img.onerror = () => {
        this.imagenCargando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la imagen',
          life: 5000
        });
      };
    };

    reader.readAsDataURL(file);
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

    let operacion;

    if (this.editando && this.sala.id) {
      operacion = this.salaService.editar(this.sala.id, this.sala as Sala, this.imagenArchivo);
    } else {
      if (!this.imagenArchivo) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe seleccionar una imagen',
          life: 5000
        });
        this.isLoading = false;
        return;
      }
      operacion = this.salaService.crear(this.sala as Sala, this.imagenArchivo);
    }

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

  cancelar(): void {
    this.router.navigate(['/admin/salas']);
  }

  get imagenPreview(): string {
    return this.sala.logo || 'assets/images/logo_1.png';
  }

  onProvinciaChange(): void {
    const prov = this.provincias.find(p => p.nombre === this.sala.provincia);
    if (prov) {
      const codigoProv = prov.codigo;
      if (!this.sala.codigoPostal || !this.sala.codigoPostal.startsWith(codigoProv)) {
        this.sala.codigoPostal = codigoProv;
      }
    } else {
      this.sala.codigoPostal = '';
    }
  }

  onCodigoPostalInput(): void {
    const prov = this.provincias.find(p => p.nombre === this.sala.provincia);
    if (prov) {
      const prefijo = prov.codigo;
      if (!this.sala.codigoPostal?.startsWith(prefijo)) {
        this.sala.codigoPostal = prefijo;
      }
    }
  }
}
