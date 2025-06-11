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

  // Filtros aplicados (los que realmente se usan en la búsqueda)
  filtrosAplicados: FiltrosSala = {
    texto: '',
    ciudad: '',
    provincia: '',
    capacidadMin: 0
  };

  // Filtros temporales (los que se muestran en el formulario)
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

  // Búsqueda con debounce para el buscador principal
  private searchSubject = new Subject<string>();

  constructor(
    private salasService: SalasService,
    private router: Router
  ) {
    // Configurar debounce para búsqueda por texto
    this.searchSubject.pipe(
      debounceTime(800),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.filtrosAplicados.texto = searchTerm;
      this.buscarConTexto();
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
      termino: this.filtrosAplicados.texto || undefined
    };

    // Determinar qué tipo de búsqueda realizar basado en los filtros aplicados
    if (this.filtrosAplicados.capacidadMin > 0) {
      this.cargarSalasPorCapacidad(params);
    } else if (this.filtrosAplicados.ciudad.trim()) {
      this.cargarSalasPorCiudad(params);
    } else if (this.filtrosAplicados.provincia.trim()) {
      this.cargarSalasPorProvincia(params);
    } else {
      this.cargarSalasGenerales(params);
    }
  }

  private cargarSalasGenerales(params: PaginationParams): void {
    this.salasService.obtenerTodasPaginadas(params).subscribe({
      next: (respuesta) => {
        this.actualizarDatosPaginacion(respuesta);
        this.cargando = false;
      },
      error: (err) => {
        this.manejarError('Error al cargar las salas', err);
      }
    });
  }

  private cargarSalasPorCapacidad(params: PaginationParams): void {
    this.salasService.filtrarPorCapacidadPaginado(
      this.filtrosAplicados.capacidadMin,
      999999,
      params
    ).subscribe({
      next: (respuesta) => {
        this.actualizarDatosPaginacion(respuesta);
        this.cargando = false;
      },
      error: (err) => {
        this.manejarError('Error al filtrar por capacidad', err);
      }
    });
  }

  private cargarSalasPorCiudad(params: PaginationParams): void {
    this.salasService.buscarSalasPorCiudadPaginadas(this.filtrosAplicados.ciudad, params).subscribe({
      next: (respuesta) => {
        this.actualizarDatosPaginacion(respuesta);
        this.cargando = false;
      },
      error: (err) => {
        this.manejarError('Error al buscar por ciudad', err);
      }
    });
  }

  private cargarSalasPorProvincia(params: PaginationParams): void {
    this.salasService.buscarSalasPorProvinciaPaginadas(this.filtrosAplicados.provincia, params).subscribe({
      next: (respuesta) => {
        this.actualizarDatosPaginacion(respuesta);
        this.cargando = false;
      },
      error: (err) => {
        this.manejarError('Error al buscar por provincia', err);
      }
    });
  }

  private actualizarDatosPaginacion(respuesta: RespuestaPaginada<Sala>): void {
    this.salas = respuesta.items;
    this.totalSalas = respuesta.totalItems;
    this.totalItems = respuesta.totalItems;
    this.totalPaginas = respuesta.totalPages;
    this.paginaNavegacion = respuesta.currentPage + 1;
  }

  // Método para búsqueda por texto (con debounce)
  actualizarBusquedaTexto(): void {
    this.filtrosAplicados.texto = this.filtros.texto;
  }

  buscarPorBoton(): void {
    this.paginaActual = 0;
    this.cargarSalas();
  }

  private buscarConTexto(): void {

    this.paginaActual = 0;
    this.cargarSalas();
  }

  // Método para aplicar todos los filtros avanzados
  aplicarFiltros(): void {
    // Copiar los filtros temporales a los aplicados
    this.filtrosAplicados = {
      texto: this.filtrosAplicados.texto, // Mantener la búsqueda por texto
      ciudad: this.filtros.ciudad.trim(),
      provincia: this.filtros.provincia.trim(),
      capacidadMin: this.filtros.capacidadMin
    };

    // Validar que solo se aplique un filtro avanzado a la vez
    if (this.filtrosAplicados.ciudad && this.filtrosAplicados.provincia) {
      // Si ambos están llenos, dar preferencia a ciudad
      this.filtrosAplicados.provincia = '';
      this.filtros.provincia = '';
    }

    if ((this.filtrosAplicados.ciudad || this.filtrosAplicados.provincia) && this.filtrosAplicados.capacidadMin > 0) {
      // Si hay filtro de ubicación y capacidad, dar preferencia a ubicación
      this.filtrosAplicados.capacidadMin = 0;
      this.filtros.capacidadMin = 0;
    }

    this.paginaActual = 0;
    this.cargarSalas();
  }

  // Limpiar un filtro específico
  limpiarFiltro(filtro: keyof FiltrosSala): void {
    if (filtro === 'capacidadMin') {
      this.filtros[filtro] = 0;
      this.filtrosAplicados[filtro] = 0;
    } else {
      this.filtros[filtro] = '';
      this.filtrosAplicados[filtro] = '';
    }

    this.paginaActual = 0;
    this.cargarSalas();
  }

  // Limpiar todos los filtros
  limpiarTodosFiltros(): void {
    this.filtros = {
      texto: '',
      ciudad: '',
      provincia: '',
      capacidadMin: 0
    };

    this.filtrosAplicados = {
      texto: '',
      ciudad: '',
      provincia: '',
      capacidadMin: 0
    };

    this.paginaActual = 0;
    this.cargarSalas();
  }

  // Métodos de ordenación
  cambiarOrden(nuevoOrden: string): void {
    this.ordenActual = nuevoOrden;
    this.paginaActual = 0;
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
  trackBySalaId(index: number, sala: Sala) {
    return sala.id;
  }

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
    return this.filtrosAplicados.ciudad !== '' ||
      this.filtrosAplicados.provincia !== '' ||
      this.filtrosAplicados.capacidadMin > 0 ||
      this.filtrosAplicados.texto !== '';
  }

  irAReservarSala(salaId: number): void {
    this.router.navigate(['/salas', salaId]);
  }

  private manejarError(mensaje: string, error: any): void {
    console.error(mensaje, error);
    this.errorMessage = `${mensaje}. Por favor, intente nuevamente.`;
    this.cargando = false;
    this.totalItems = 0;
  }

  get totalSalasDisponibles(): number {
    return this.totalItems || 0;
  }
}
