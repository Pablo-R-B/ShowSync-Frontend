import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {NgClass, NgFor, NgIf} from '@angular/common';

import { GenerosMusicalesService } from '../../../servicios/generos-musicales.service';
import { GeneroMusicalDTO } from '../../../interfaces/GeneroMusicalDTO';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-panel-genero',
  standalone: true,
  imports: [
    FormsModule,
    NgFor,
    NgIf,
    NgClass
  ],
  templateUrl: './panel-generos.component.html',
  styleUrls: ['./panel-generos.component.css']
})
export class PanelGenerosComponent implements OnInit {

  cargando: boolean = true;
  error: string | null = null;
  generos: GeneroMusicalDTO[] = [];

  // Modal
  mostrarModal: boolean = false;
  generoEditando: GeneroMusicalDTO | null = null;
  nombreGenero: string = '';
  private mensajeExito: string | undefined;
  private mensajeError: string | undefined;

  toastVisible: boolean = false;
  toastMensaje: string = '';
  toastColor: 'success' | 'error' = 'success';

  // Configuración de SweetAlert
  readonly SWAL_CONFIG = {
    deleteTitle: '¿Estás seguro?',
    deleteText: 'Esta acción no se puede deshacer.',
    deleteIcon: 'warning',
    deleteIconColor: '#BF0D22',
    confirmButtonText: 'Sí, eliminar',
    confirmButtonColor: '#BF0D22',
    cancelButtonText: 'Cancelar'
  };



  constructor(private generosService: GenerosMusicalesService) {}

  ngOnInit(): void {
    this.obtenerGeneros();
  }

  obtenerGeneros(): void {
    this.cargando = true;
    this.error = null;

    this.generosService.listarGenerosConId().subscribe({
      next: (generos) => {
        this.generos = generos;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los géneros musicales. Por favor, inténtelo de nuevo más tarde.';
        this.cargando = false;
        console.error('Error al obtener géneros:', err);
      }
    });
  }

  mostrarModalEditar(genero: GeneroMusicalDTO) {
    this.generoEditando = { ...genero }; // Clonar objeto para evitar mutar directo
    this.nombreGenero = genero.nombre;
    this.mostrarModal = true;
  }

  mostrarModalCrear() {
    this.generoEditando = null;
    this.nombreGenero = '';
    this.mostrarModal = true;
  }

  crearGenero() {
    const nombreTrim = this.nombreGenero.trim();
    if (!nombreTrim) return;

    this.generosService.crearGenero(nombreTrim).subscribe({
      next: () => {
        this.mostrarModal = false;
        this.nombreGenero = '';
        this.obtenerGeneros();
        this.mostrarToast('Género creado con éxito.', 'success');
      },
      error: (error) => {
        if (error.status === 409) {
          this.mostrarToast('Ese género ya existe.', 'error');
        } else {
          this.mostrarToast('Error del servidor. Intenta más tarde.', 'error');
        }
      }
    });
  }



  actualizarGenero() {
    if (!this.generoEditando) return;

    const nombreTrim = this.nombreGenero.trim();
    if (!nombreTrim) return;

    const generoActualizado: GeneroMusicalDTO = {
      id: this.generoEditando.id,
      nombre: nombreTrim
    };

    this.generosService.actualizarGenero(generoActualizado).subscribe({
      next: () => {
        this.obtenerGeneros();
        this.mostrarModal = false;
        this.generoEditando = null;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Error al actualizar el género. Por favor, inténtelo de nuevo.';
        console.error('Error actualizar género:', err);
      }
    });
  }

  eliminarGenero(genero: GeneroMusicalDTO): void {
    Swal.fire({
      title: this.SWAL_CONFIG.deleteTitle,
      text: this.SWAL_CONFIG.deleteText,
      icon: 'warning',
      showCancelButton: true,
      iconColor: this.SWAL_CONFIG.deleteIconColor,
      confirmButtonText: this.SWAL_CONFIG.confirmButtonText,
      confirmButtonColor: this.SWAL_CONFIG.confirmButtonColor,
      cancelButtonText: this.SWAL_CONFIG.cancelButtonText
    }).then((result) => {
      if (result.isConfirmed) {
        this.generosService.eliminarGenero(genero.id).subscribe({
          next: () => {
            this.obtenerGeneros();
            this.error = null;
            this.mostrarToast("Eliminado con éxito");
          },
          error: (err) => {
            this.error = "Error al eliminar el género. Por favor, inténtelo de nuevo.";
            console.error("Error al eliminar género:", err);
            Swal.fire("Error", "No se pudo eliminar el género. Intente más tarde.", "error");
          }
        });
      }
    });
  }


  mostrarToast(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensaje = mensaje;
    this.toastColor = tipo;
    this.toastVisible = true;

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000); // Ocultar después de 3 segundos
  }

}
