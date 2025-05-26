import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sala } from '../../interfaces/sala';
import { SalasService, PaginationParams } from '../../servicios/salas.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FiltrosSala } from '../../interfaces/filtrosSala';
import { Router } from '@angular/router';

@Component({
  selector: 'app-catalogo-sala',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-sala.component.html',
  styleUrls: ['./catalogo-sala.component.css']
})
export class CatalogoSalaComponent implements OnInit {
  // Datos principales
  salas: Sala[] = [];

  // Estado y mensajes
  cargando: boolean = false;
  errorMessage: string | null = null;

  // Paginación (usando paginación del backend, base 0)
  paginaActual: number = 0; // Backend usa base 0
  itemsPorPagina: number = 6;
  totalSalas: number = 0;
  totalPaginas: number = 0;

  // AGREGADO: Variable para navegación rápida
  paginaNavegacion: number = 1;

  // Filtros
  filtros: FiltrosSala = {
    texto: '',
    ciudad: '',
    provincia: '',
    capacidadMin: 0
  };

  // Ordenación
  ordenActual: string = 'nombre-asc';
  opcionesOrden = [
    { valor: 'nombre-asc', texto: 'Nombre (A-Z)' },
    { valor: 'nombre-desc', texto: 'Nombre (Z-A)' },
    { valor: 'ciudad-asc', texto: 'Ciudad (A-Z)' },
    { valor: 'ciudad-desc', texto: 'Ciudad (Z-A)' },
    { valor: 'provincia-asc', texto: 'Provincia (A-Z)' },
    { valor: 'provincia-desc', texto: 'Provincia (Z-A)' },
    { valor: 'capacidad-asc', texto: 'Capacidad (Menor)' },
    { valor: 'capacidad-desc', texto: 'Capacidad (Mayor)' }
  ];

  // Control de tipo de filtro activo
  tipoFiltroActivo: 'general' | 'capacidad' | 'ciudad' | 'provincia' = 'general';

  // Búsqueda con debounce
  private searchSubject = new Subject<string>();

  constructor(
    private salasService: SalasService,
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
    this.cargando = true;
    this.errorMessage = null;

    const params: PaginationParams = {
      page: this.paginaActual,
      size: this.itemsPorPagina,
      termino: this.filtros.texto || undefined
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
    this.salasService.obtenerTodasPaginadas(params).subscribe({
      next: (data) => {
        this.salas = data;
        this.actualizarPaginacionSimulada(data.length);
        this.aplicarOrdenLocal();
        this.cargando = false;
      },
      error: (err) => {
        this.manejarError('Error al cargar las salas', err);
      }
    });
  }

  private cargarSalasPorCapacidad(params: PaginationParams): void {
    if (this.filtros.capacidadMin > 0) {
      this.salasService.filtrarPorCapacidadPaginado(
        this.filtros.capacidadMin,
        999999,
        params
      ).subscribe({
        next: (data) => {
          this.salas = data;
          this.actualizarPaginacionSimulada(data.length);
          this.aplicarOrdenLocal();
          this.cargando = false;
        },
        error: (err) => {
          this.manejarError('Error al filtrar por capacidad', err);
        }
      });
    }
  }

  private cargarSalasPorCiudad(params: PaginationParams): void {
    if (this.filtros.ciudad.trim()) {
      this.salasService.buscarSalasPorCiudadPaginadas(this.filtros.ciudad, params).subscribe({
        next: (response) => {
          this.salas = response.content;
          this.totalSalas = response.totalElements;
          this.totalPaginas = response.totalPages;
          this.aplicarOrdenLocal();
          this.cargando = false;
        },
        error: (err) => {
          this.manejarError('Error al buscar por ciudad', err);
        }
      });
    }
  }

  private cargarSalasPorProvincia(params: PaginationParams): void {
    if (this.filtros.provincia.trim()) {
      this.salasService.buscarSalasPorProvinciaPaginadas(this.filtros.provincia, params).subscribe({
        next: (response) => {
          this.salas = response.content;
          this.totalSalas = response.totalElements;
          this.totalPaginas = response.totalPages;
          this.aplicarOrdenLocal();
          this.cargando = false;
        },
        error: (err) => {
          this.manejarError('Error al buscar por provincia', err);
        }
      });
    }
  }

  private actualizarPaginacionSimulada(cantidadRecibida: number): void {
    if (cantidadRecibida < this.itemsPorPagina) {
      this.totalPaginas = this.paginaActual + 1;
    } else {
      this.totalPaginas = this.paginaActual + 2;
    }
    this.totalSalas = (this.paginaActual * this.itemsPorPagina) + cantidadRecibida;
  }

  // Métodos de filtrado
  actualizarBusquedaTexto(): void {
    this.searchSubject.next(this.filtros.texto);
  }

  private buscarConDebounce(termino: string): void {
    this.tipoFiltroActivo = 'general';
    this.paginaActual = 0;
    this.limpiarFiltrosAvanzados();
    this.cargarSalas();
  }

  aplicarFiltroCapacidad(): void {
    if (this.filtros.capacidadMin > 0) {
      this.tipoFiltroActivo = 'capacidad';
      this.paginaActual = 0;
      this.cargarSalas();
    }
  }

  aplicarFiltroCiudad(): void {
    if (this.filtros.ciudad.trim()) {
      this.tipoFiltroActivo = 'ciudad';
      this.paginaActual = 0;
      this.cargarSalas();
    }
  }

  aplicarFiltroProvincia(): void {
    if (this.filtros.provincia.trim()) {
      this.tipoFiltroActivo = 'provincia';
      this.paginaActual = 0;
      this.cargarSalas();
    }
  }

  limpiarFiltro(filtro: keyof FiltrosSala): void {
    if (filtro === 'capacidadMin') {
      this.filtros[filtro] = 0;
    } else {
      this.filtros[filtro] = '';
    }
    this.tipoFiltroActivo = 'general';
    this.paginaActual = 0;
    this.cargarSalas();
  }

  limpiarTodosFiltros(): void {
    this.filtros = {
      texto: '',
      ciudad: '',
      provincia: '',
      capacidadMin: 0
    };
    this.limpiarFiltrosAvanzados();
    this.tipoFiltroActivo = 'general';
    this.paginaActual = 0;
    this.cargarSalas();
  }

  private limpiarFiltrosAvanzados(): void {
    this.filtros.capacidadMin = 0;
    this.filtros.ciudad = '';
    this.filtros.provincia = '';
  }

  // Métodos de ordenación
  cambiarOrden(nuevoOrden: string): void {
    this.ordenActual = nuevoOrden;
    this.aplicarOrdenLocal();
  }

  private aplicarOrdenLocal(): void {
    switch(this.ordenActual) {
      case 'nombre-asc':
        this.salas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        this.salas.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'ciudad-asc':
        this.salas.sort((a, b) => a.ciudad.localeCompare(b.ciudad));
        break;
      case 'ciudad-desc':
        this.salas.sort((a, b) => b.ciudad.localeCompare(a.ciudad));
        break;
      case 'provincia-asc':
        this.salas.sort((a, b) => a.provincia.localeCompare(b.provincia));
        break;
      case 'provincia-desc':
        this.salas.sort((a, b) => b.provincia.localeCompare(a.provincia));
        break;
      case 'capacidad-asc':
        this.salas.sort((a, b) => a.capacidad - b.capacidad);
        break;
      case 'capacidad-desc':
        this.salas.sort((a, b) => b.capacidad - a.capacidad);
        break;
      default:
        break;
    }
  }

  // Métodos de paginación
  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.paginaActual = pagina;
    // Actualizar también la variable de navegación rápida
    this.paginaNavegacion = pagina + 1;
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

  cambiarItemsPorPagina(): void {
    this.paginaActual = 0;
    this.paginaNavegacion = 1;
    this.cargarSalas();
  }

  // AGREGADO: Método para navegación rápida
  irAPagina(): void {
    if (this.paginaNavegacion && this.paginaNavegacion >= 1 && this.paginaNavegacion <= this.totalPaginas) {
      this.cambiarPagina(this.paginaNavegacion - 1); // Convertir de base 1 a base 0
    } else {
      // Resetear si el valor no es válido
      this.paginaNavegacion = this.paginaActualDisplay;
    }
  }

  // Métodos auxiliares para la vista
  get paginaActualDisplay(): number {
    return this.paginaActual + 1;
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

  // Métodos auxiliares de utilidad
  hayFiltrosActivos(): boolean {
    return this.filtros.ciudad !== '' ||
      this.filtros.provincia !== '' ||
      this.filtros.capacidadMin > 0 ||
      this.filtros.texto !== '';
  }

  irAReservarSala(salaId: number): void {
    // Ruta más específica para reservar sala
    this.router.navigate(['/reservar-sala', salaId]);
  }

  // Método auxiliar para manejo de errores
  private manejarError(mensaje: string, error: any): void {
    console.error(mensaje, error);
    this.errorMessage = `${mensaje}. Por favor, intente nuevamente.`;
    this.cargando = false;
  }
}
