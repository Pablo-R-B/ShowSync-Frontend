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

  // Propiedades para el toast personalizado
  toastVisible = false;
  toastMensaje = '';
  toastColor: 'success' | 'error' = 'success';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salaService: SalasService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarSala(+id);
    }
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensaje = mensaje;
    this.toastColor = tipo;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000); // Ocultar después de 3 segundos
  }

  subirImagen(event: any): void {
    const file: File = event.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      this.mostrarToast('Solo se permiten archivos de imagen', 'error');
      return;
    }

    const maxFileSizeBytes = this.maxFileSize * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      this.mostrarToast('La imagen es muy grande, se intentará redimensionar automáticamente.');
    }

    this.imagenCargando = true;
    this.mostrarToast('Procesando imagen...');

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

            this.mostrarToast('Imagen cargada y redimensionada correctamente');
          };

          previewReader.readAsDataURL(base64);
        } catch (error) {
          console.error('Error al redimensionar la imagen:', error);
          this.imagenCargando = false;
          this.mostrarToast('No se pudo redimensionar la imagen', 'error');
        }
      };

      img.onerror = () => {
        this.imagenCargando = false;
        this.mostrarToast('No se pudo cargar la imagen', 'error');
      };
    };

    reader.onerror = () => {
      this.imagenCargando = false;
      this.mostrarToast('Error al leer el archivo de imagen', 'error');
    };

    reader.readAsDataURL(file);
  }

  cargarSala(id: number): void {
    this.isLoading = true;
    this.editando = true;
    this.mostrarToast('Cargando información de la sala...');

    this.salaService.obtenerPorId(id).subscribe({
      next: (data) => {
        this.sala = data;
        this.isLoading = false;
        this.mostrarToast('Sala cargada correctamente');
      },
      error: (err) => {
        console.error('Error al obtener sala:', err);
        this.mostrarToast('No se pudo cargar la sala', 'error');
        this.isLoading = false;
      }
    });
  }

  guardarSala(): void {
    if (!this.validarFormulario()) return;
    if (this.isLoading) return;

    this.isLoading = true;
    this.mostrarToast(`${this.editando ? 'Actualizando' : 'Creando'} sala...`);

    let operacion;

    if (this.editando && this.sala.id) {
      operacion = this.salaService.editar(this.sala.id, this.sala as Sala, this.imagenArchivo);
    } else {
      if (!this.imagenArchivo) {
        this.mostrarToast('Debe seleccionar una imagen', 'error');
        this.isLoading = false;
        return;
      }
      operacion = this.salaService.crear(this.sala as Sala, this.imagenArchivo);
    }

    operacion.subscribe({
      next: () => {
        this.mostrarToast(`Sala ${this.editando ? 'actualizada' : 'creada'} correctamente`);

        // Pequeño delay para que el usuario vea el mensaje antes de navegar
        setTimeout(() => {
          this.router.navigate(['/admin/salas']);
        }, 1500);
      },
      error: (err) => {
        console.error(`Error al ${this.editando ? 'actualizar' : 'crear'} sala:`, err);
        const mensajeError = err?.error?.message || '';

        if (mensajeError.includes('Ya existe una sala con el mismo nombre y dirección')) {
          this.mostrarToast('Ya existe una sala con el mismo nombre y dirección', 'error');
        } else {
          this.mostrarToast(`No se pudo ${this.editando ? 'actualizar' : 'crear'} la sala porque ya existe.`, 'error');
        }
        this.isLoading = false;
      }
    });
  }

  cancelar(): void {
    this.mostrarToast('Operación cancelada');

    // Pequeño delay para que el usuario vea el mensaje antes de navegar
    setTimeout(() => {
      this.router.navigate(['/admin/salas']);
    }, 1000);
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
        this.mostrarToast(`Código postal actualizado automáticamente a ${codigoProv}`);
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
        this.mostrarToast(`El código postal debe comenzar con ${prefijo}`, 'error');
      }
    }
  }

  private validarFormulario(): boolean {
    if (!this.sala.nombre?.trim() || this.sala.nombre.length < 3 || this.sala.nombre.length > 50) {
      this.mostrarToast('El nombre es obligatorio', 'error');
      return false;
    }


    if (!this.sala.direccion?.trim()) {
      this.mostrarToast('La dirección es obligatoria', 'error');
      return false;
    }

    if (!this.sala.capacidad || this.sala.capacidad <= 0) {
      this.mostrarToast('La capacidad debe ser mayor a 0', 'error');
      return false;
    }

    if (!this.sala.ciudad?.trim()) {
      this.mostrarToast('La ciudad es obligatoria', 'error');
      return false;
    }

    if (!this.sala.provincia?.trim()) {
      this.mostrarToast('La provincia es obligatoria', 'error');
      return false;
    }

    if (!this.sala.codigoPostal?.trim()) {
      this.mostrarToast('El código postal es obligatorio', 'error');
      return false;
    }

    if (!this.sala.descripcion?.trim() || this.sala.descripcion.length < 20 || this.sala.descripcion.length > 500) {
      this.mostrarToast('La descripción debe tener entre 20 y 500 caracteres', 'error');
      return false;
    }

    if (!this.imagenArchivo) {
      this.mostrarToast('Debe seleccionar una imagen', 'error');
      return false;
    }

    if (this.imagenArchivo.size > this.maxFileSize * 1024 * 1024) {
      this.mostrarToast(`La imagen no debe superar los ${this.maxFileSize} MB`, 'error');
      return false;
    }



    return true;
  }
}
