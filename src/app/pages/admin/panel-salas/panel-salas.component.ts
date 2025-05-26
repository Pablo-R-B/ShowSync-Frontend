import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {CommonModule, NgFor, NgForOf, NgIf} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { SalasService } from '../../../servicios/salas.service';
import Swal from 'sweetalert2';
import { Sala } from '../../../interfaces/sala';

@Component({
  selector: 'app-panel-salas',
  templateUrl: './panel-salas.component.html',
  standalone: true,

  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ]
})


export class PanelSalasComponent implements OnInit {
  // Datos principales
  salas: Sala[] = [];
  salasFiltradas: Sala[] = [];
  salasPaginadas: Sala[] = [];

  // Estado y mensajes
  filtro: string = '';
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 6;
  totalPaginas: number = 1;

  // Ordenación
  ordenActual: string = 'nombre-asc'; // Valores: 'nombre-asc', 'nombre-desc', 'capacidad-asc', 'capacidad-desc'

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

  constructor(
    private salaService: SalasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerSalas();
  }

  obtenerSalas(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.salaService.obtenerTodas().subscribe({
      next: (data) => {
        this.salas = data;
        this.salasFiltradas = [...data];
        this.aplicarOrden();
        this.calcularTotalPaginas();
        this.actualizarSalasPaginadas();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener salas:', err);
        this.errorMessage = 'Error al cargar las salas. Por favor, intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  filtrarSalas(): void {
    if (!this.filtro) {
      this.salasFiltradas = [...this.salas];
    } else {
      const texto = this.filtro.toLowerCase();
      this.salasFiltradas = this.salas.filter(sala =>
        sala.nombre.toLowerCase().includes(texto) ||
        (sala.direccion && sala.direccion.toLowerCase().includes(texto)) ||
        (sala.ciudad && sala.ciudad.toLowerCase().includes(texto)) ||
        sala.capacidad.toString().includes(texto)
      );
    }
    this.aplicarOrden();
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarSalasPaginadas();
  }

  // Métodos de ordenación
  cambiarOrden(nuevoOrden: string): void {
    this.ordenActual = nuevoOrden;
    this.aplicarOrden();
    this.paginaActual = 1;
    this.actualizarSalasPaginadas();
  }

  aplicarOrden(): void {
    switch(this.ordenActual) {
      case 'nombre-asc':
        this.salasFiltradas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        this.salasFiltradas.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'capacidad-asc':
        this.salasFiltradas.sort((a, b) => a.capacidad - b.capacidad);
        break;
      case 'capacidad-desc':
        this.salasFiltradas.sort((a, b) => b.capacidad - a.capacidad);
        break;
      default:
        break;
    }
  }

  // Métodos de paginación
  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.salasFiltradas.length / this.itemsPorPagina);
    if (this.totalPaginas === 0) this.totalPaginas = 1;
  }

  actualizarSalasPaginadas(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.salasPaginadas = this.salasFiltradas.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarSalasPaginadas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  mostrarNumeroPagina(pagina: number): boolean {
    if (pagina === 1 || pagina === this.totalPaginas) return true;
    return Math.abs(pagina - this.paginaActual) <= 1;
  }

  mostrarPuntosSuspensivos(pagina: number): boolean {
    if (pagina === this.totalPaginas) return false;
    return !this.mostrarNumeroPagina(pagina) && this.mostrarNumeroPagina(pagina + 1);
  }

  // Métodos de navegación
  crearSala(): void {
    this.router.navigate(['/admin/salas/nueva']);
  }

  editarSala(id: number): void {
    this.router.navigate([`/admin/salas/editar/${id}`]);
  }

  verPerfilSala(id: number): void {
    this.router.navigate([`/salas/${id}`]);
  }

  eliminarSala(id: number): void {
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
        this.salaService.eliminar(id).subscribe({
          next: () => this.obtenerSalas(),
          error: (err) => {
            console.error('Error al eliminar sala:', err);
            Swal.fire('Error', 'No se pudo eliminar la sala', 'error');
          }
        });
      }
    });
  }
}
