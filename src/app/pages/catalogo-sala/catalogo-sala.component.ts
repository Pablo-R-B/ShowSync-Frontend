import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sala } from '../../interfaces/sala';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FiltrosSala } from '../../interfaces/filtrosSala';
import { Router } from '@angular/router';
import {SalasService} from '../../servicios/salas.service';
import {PaginationParams} from '../../interfaces/PaginationParams';
import {RespuestaPaginada} from '../../interfaces/respuesta-paginada';

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
  paginaActual: number = 0;
  itemsPorPagina: number = 6;
  totalSalas: number = 0;
  totalPaginas: number = 0;

  // Variable para navegación rápida
  paginaNavegacion: number = 1;

  totalItems: number = 0;


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

    const [sortField, sortDirection] = this.ordenActual.split('-');

    const params: PaginationParams = {
      page: this.paginaActual,
      size: this.itemsPorPagina,
      sortField: sortField,
      sortDirection: sortDirection.toUpperCase(),
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
      next: (respuesta) => {
        this.actualizarDatosPaginacion(respuesta);
        this.salas = respuesta.items;
        this.totalItems = respuesta.totalItems;
        this.cargando = false;
      },
      error: (err) => {
        this.manejarError('Error al cargar las salas', err);
        this.totalItems = 0;

      }
    });
  }

  private cargarSalasPorCapacidad(params: PaginationParams): void {
    if (this.filtros.capacidadMin > 0) {
      this.salasService.filtrarPorCapacidadPaginado(
        this.filtros.capacidadMin,
        999999, // Capacidad máxima muy alta para incluir todas las salas mayores al mínimo
        params
      ).subscribe({
        next: (respuesta) => {
          this.actualizarDatosPaginacion(respuesta);
          this.salas = respuesta.items;
          this.totalItems = respuesta.totalItems;
          this.cargando = false;
        },
        error: (err) => {
          this.manejarError('Error al filtrar por capacidad', err);
          this.totalItems = 0;

        }
      });
    }
  }

  private cargarSalasPorCiudad(params: PaginationParams): void {
    if (this.filtros.ciudad.trim()) {
      this.salasService.buscarSalasPorCiudadPaginadas(this.filtros.ciudad, params).subscribe({
        next: (respuesta) => {
          this.salas = respuesta.items;
          this.totalItems = respuesta.totalItems;
          this.actualizarDatosPaginacion(respuesta);
          this.cargando = false;
        },
        error: (err) => {
          this.manejarError('Error al buscar por ciudad', err);
          this.totalItems = 0;

        }
      });
    }
  }

  private cargarSalasPorProvincia(params: PaginationParams): void {
    if (this.filtros.provincia.trim()) {
      this.salasService.buscarSalasPorProvinciaPaginadas(this.filtros.provincia, params).subscribe({
        next: (respuesta) => {
          this.salas = respuesta.items;
          this.totalItems = respuesta.totalItems;
          this.actualizarDatosPaginacion(respuesta);
          this.cargando = false;
        },
        error: (err) => {
          this.manejarError('Error al buscar por provincia', err);
          this.totalItems = 0;

        }
      });
    }
  }

  private actualizarDatosPaginacion(respuesta: RespuestaPaginada<Sala>): void {
    this.salas = respuesta.items;
    this.totalSalas = respuesta.totalItems;
    this.totalPaginas = respuesta.totalPages;
    this.paginaNavegacion = respuesta.currentPage + 1; // Actualizar navegación rápida
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
    this.paginaActual = 0; // Resetear a primera página al cambiar orden
    this.cargarSalas();
  }

  // Métodos de paginación
  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.paginaActual = pagina;
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

  irAPagina(): void {
    if (this.paginaNavegacion && this.paginaNavegacion >= 1 && this.paginaNavegacion <= this.totalPaginas) {
      this.cambiarPagina(this.paginaNavegacion - 1);
    } else {
      this.paginaNavegacion = this.paginaActual + 1;
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

  hayFiltrosActivos(): boolean {
    return this.filtros.ciudad !== '' ||
      this.filtros.provincia !== '' ||
      this.filtros.capacidadMin > 0 ||
      this.filtros.texto !== '';
  }

  irAReservarSala(salaId: number): void {
    this.router.navigate(['/salas', salaId]);
  }

  private manejarError(mensaje: string, error: any): void {
    console.error(mensaje, error);
    this.errorMessage = `${mensaje}. Por favor, intente nuevamente.`;
    this.cargando = false;
  }

  get totalSalasDisponibles(): number {
    return this.totalItems || 0;
  }
}
