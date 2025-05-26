import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgForOf, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SalasService, PaginationParams } from '../../../servicios/salas.service';
import Swal from 'sweetalert2';
import { Sala } from '../../../interfaces/sala';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-panel-salas',
  templateUrl: './panel-salas.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf,
    CommonModule
  ]
})
export class PanelSalasComponent implements OnInit {
  // Datos principales
  salas: Sala[] = [];

  // Estado y mensajes
  filtro: string = '';
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Paginación (usando paginación del backend)
  paginaActual: number = 0; // Backend usa base 0
  itemsPorPagina: number = 6;
  totalSalas: number = 0;
  totalPaginas: number = 0;

  // Filtros avanzados
  filtroCapacidadMin: number | null = null;
  filtroCapacidadMax: number | null = null;
  filtroCiudad: string = '';
  filtroProvincia: string = '';
  tipoFiltroActivo: 'general' | 'capacidad' | 'ciudad' | 'provincia' = 'general';

  // Búsqueda con debounce
  private searchSubject = new Subject<string>();

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
  ) {
    // Configurar debounce para búsqueda
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.buscarConDebounce(searchTerm);
    });
  }

  ngOnInit(): void {
    this.cargarSalas();
  }

  // Método principal para cargar salas
  cargarSalas(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const params: PaginationParams = {
      page: this.paginaActual,
      size: this.itemsPorPagina,
      termino: this.filtro || undefined
    };

    switch (this.tipoFiltroActivo) {
      case 'general':
        this.cargarSalasGenerales(params);
        break;
      case 'capacidad':
        this.cargarSalasPorCapacidad(params);
        break;
      case 'ciudad':
        this.cargarSalasPorCiudad(params);
        break;
      case 'provincia':
        this.cargarSalasPorProvincia(params);
        break;
    }
  }

  private cargarSalasGenerales(params: PaginationParams): void {
    this.salaService.obtenerTodasPaginadas(params).subscribe({
      next: (data) => {
        this.salas = data;
        // Nota: Como el backend actual devuelve Sala[] en lugar de PageResponse,
        // simulamos la información de paginación
        this.actualizarPaginacionSimulada(data.length);
        this.isLoading = false;
      },
      error: (err) => {
        this.manejarError('Error al cargar las salas', err);
      }
    });
  }

  private cargarSalasPorCapacidad(params: PaginationParams): void {
    if (this.filtroCapacidadMin !== null && this.filtroCapacidadMax !== null) {
      this.salaService.filtrarPorCapacidadPaginado(
        this.filtroCapacidadMin,
        this.filtroCapacidadMax,
        params
      ).subscribe({
        next: (data) => {
          this.salas = data;
          this.actualizarPaginacionSimulada(data.length);
          this.isLoading = false;
        },
        error: (err) => {
          this.manejarError('Error al filtrar por capacidad', err);
        }
      });
    }
  }

  private cargarSalasPorCiudad(params: PaginationParams): void {
    if (this.filtroCiudad) {
      this.salaService.buscarSalasPorCiudadPaginadas(this.filtroCiudad, params).subscribe({
        next: (response) => {
          this.salas = response.content;
          this.totalSalas = response.totalElements;
          this.totalPaginas = response.totalPages;
          this.isLoading = false;
        },
        error: (err) => {
          this.manejarError('Error al buscar por ciudad', err);
        }
      });
    }
  }

  private cargarSalasPorProvincia(params: PaginationParams): void {
    if (this.filtroProvincia) {
      this.salaService.buscarSalasPorProvinciaPaginadas(this.filtroProvincia, params).subscribe({
        next: (response) => {
          this.salas = response.content;
          this.totalSalas = response.totalElements;
          this.totalPaginas = response.totalPages;
          this.isLoading = false;
        },
        error: (err) => {
          this.manejarError('Error al buscar por provincia', err);
        }
      });
    }
  }

  // Método auxiliar para simular paginación cuando el backend no devuelve PageResponse
  private actualizarPaginacionSimulada(cantidadRecibida: number): void {
    // Si recibimos menos elementos que el tamaño solicitado, probablemente es la última página
    if (cantidadRecibida < this.itemsPorPagina) {
      this.totalPaginas = this.paginaActual + 1;
    } else {
      // Estimamos que hay al menos una página más
      this.totalPaginas = this.paginaActual + 2;
    }
    this.totalSalas = (this.paginaActual * this.itemsPorPagina) + cantidadRecibida;
  }

  // Métodos de filtrado
  onFiltroChange(): void {
    this.searchSubject.next(this.filtro);
  }

  private buscarConDebounce(termino: string): void {
    this.tipoFiltroActivo = 'general';
    this.paginaActual = 0;
    this.limpiarFiltrosAvanzados();
    this.cargarSalas();
  }

  filtrarPorCapacidad(): void {
    if (this.filtroCapacidadMin !== null && this.filtroCapacidadMax !== null) {
      if (this.filtroCapacidadMin > this.filtroCapacidadMax) {
        Swal.fire('Error', 'La capacidad mínima no puede ser mayor que la máxima', 'error');
        return;
      }
      this.tipoFiltroActivo = 'capacidad';
      this.paginaActual = 0;
      this.cargarSalas();
    }
  }

  filtrarPorCiudad(): void {
    if (this.filtroCiudad.trim()) {
      this.tipoFiltroActivo = 'ciudad';
      this.paginaActual = 0;
      this.cargarSalas();
    }
  }

  filtrarPorProvincia(): void {
    if (this.filtroProvincia.trim()) {
      this.tipoFiltroActivo = 'provincia';
      this.paginaActual = 0;
      this.cargarSalas();
    }
  }

  limpiarFiltros(): void {
    this.filtro = '';
    this.limpiarFiltrosAvanzados();
    this.tipoFiltroActivo = 'general';
    this.paginaActual = 0;
    this.cargarSalas();
  }

  private limpiarFiltrosAvanzados(): void {
    this.filtroCapacidadMin = null;
    this.filtroCapacidadMax = null;
    this.filtroCiudad = '';
    this.filtroProvincia = '';
  }

  // Métodos de paginación
  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarSalas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.cambiarPagina(this.paginaActual + 1);
    }
  }

  // Métodos auxiliares para la vista
  get paginaActualDisplay(): number {
    return this.paginaActual + 1; // Para mostrar base 1 en la UI
  }

  get tieneResultados(): boolean {
    return this.salas.length > 0;
  }

  get esPrimeraPagina(): boolean {
    return this.paginaActual === 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual >= this.totalPaginas - 1;
  }

  obtenerRangoPaginas(): number[] {
    const rango = [];
    const inicio = Math.max(0, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas - 1, this.paginaActual + 2);

    for (let i = inicio; i <= fin; i++) {
      rango.push(i);
    }
    return rango;
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
          next: () => {
            Swal.fire('Eliminado', 'La sala ha sido eliminada correctamente', 'success');
            this.cargarSalas(); // Recargar la página actual
          },
          error: (err) => {
            console.error('Error al eliminar sala:', err);
            Swal.fire('Error', 'No se pudo eliminar la sala', 'error');
          }
        });
      }
    });
  }

  // Método auxiliar para manejo de errores
  private manejarError(mensaje: string, error: any): void {
    console.error(mensaje, error);
    this.errorMessage = `${mensaje}. Por favor, intente nuevamente.`;
    this.isLoading = false;
  }
}
