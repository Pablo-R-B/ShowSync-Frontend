import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgForOf, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SalasService, PaginationParams } from '../../../servicios/salas.service';
import Swal from 'sweetalert2';
import { Sala } from '../../../interfaces/sala';
import {debounceTime, distinctUntilChanged, Observable, Subject} from 'rxjs';
import {ReservasPorSala} from '../../../interfaces/ReservasPorSala';
import { Chart, registerables } from 'chart.js';
import {ReservaRaw} from '../../../interfaces/ReservaRaw';
import {SalaEstadoCantidad} from '../../../interfaces/SalaEstadoCantidad';


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
  reservasPorSala: ReservasPorSala[] = [];
  isLoadingReservas: boolean = false;
  eliminando: boolean = false;

// Configuración de la gráfica
  mostrarGrafica: boolean = false;


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

  // Gráfico de reservas por sala
  public chart: Chart | undefined;
  public chartData: any;
  public chartLabels: string[] = [];
  public chartEstados: string[] = ['en_revision', 'confirmado', 'cancelado'];


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
    Chart.register(...registerables);
    // Configurar debounce para búsqueda
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.buscarConDebounce(searchTerm);
    });

    // Cargar cantidad de reservas por sala al inicializar
    this.obtenerCantidadReservas();

    // REMOVER esta línea:
    // this.cargarDatosGrafica();
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

  private cargarSalasConPaginacionResponse(
    observable: Observable<{ content: Sala[]; totalElements: number; totalPages: number }>
  ): void {
    observable.subscribe({
      next: (response) => {
        this.salas = response.content;
        this.totalSalas = response.totalElements;
        this.totalPaginas = response.totalPages;
        this.isLoading = false;
      },
      error: (err) => {
        this.manejarError('Error al cargar salas con paginación', err);
      }
    });
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
      this.cargarSalasConPaginacionResponse(this.salaService.buscarSalasPorCiudadPaginadas(this.filtroCiudad, params));
    }
  }

  private cargarSalasPorProvincia(params: PaginationParams): void {
    if (this.filtroProvincia) {
      this.cargarSalasConPaginacionResponse(this.salaService.buscarSalasPorProvinciaPaginadas(this.filtroProvincia, params));
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
    this.filtro = termino;
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
    if (pagina < 0 || pagina >= this.totalPaginas || pagina === this.paginaActual) return;
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
    if (this.eliminando) return;

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
        this.eliminando = true;
        this.salaService.eliminar(id).subscribe({
          next: () => {
            this.eliminando = false;
            Swal.fire('Eliminado', 'La sala ha sido eliminada correctamente', 'success');
            this.cargarSalas();
          },
          error: (err) => {
            this.eliminando = false;
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



  // Método para obtener la cantidad de reservas por sala
  private obtenerCantidadReservas(): void {
    this.isLoadingReservas = true;
    this.salaService.obtenerCantidadReservasPorSala().subscribe({
      next: (reservas: Object[]) => {
        this.reservasPorSala = (reservas as ReservaRaw[]).map(reserva => ({
          salaNombre: reserva[0],
          cantidadReservas: reserva[1]
        }));
        this.isLoadingReservas = false;
      },
      error: (err) => {
        this.manejarError('No se pudieron cargar las estadísticas de reservas', err);
        this.isLoadingReservas = false;
      }

    });
  }

  getReservasPorSala(salaNombre: string): number {
    if (!this.reservasPorSala || this.reservasPorSala.length === 0) {
      return 0;
    }

    const reserva = this.reservasPorSala.find(r => r.salaNombre === salaNombre);
    return reserva ? reserva.cantidadReservas : 0;
  }


  private cargarDatosGrafica(): void {
    this.salaService.getDatosGrafica().subscribe({
      next: (data: SalaEstadoCantidad[]) => {
        console.log('Datos recibidos para gráfica:', data);

        if (!data || data.length === 0) {
          console.warn('No se recibieron datos para la gráfica.');
          return;
        }

        const salas = Array.from(new Set(data.map(d => d.salaNombre)));
        this.chartLabels = salas;

        const datasets = this.chartEstados.map(estado => ({
          label: estado,
          data: salas.map(sala =>
            data.find(d => d.salaNombre === sala && d.estado === estado)?.cantidad || 0
          ),
          backgroundColor: this.colorPorEstado(estado)
        }));

        this.chartData = {
          labels: this.chartLabels,
          datasets: datasets,
        };

        this.crearGrafica();
      },
      error: (err) => {
        console.error('Error al cargar datos para gráfica:', err);
        this.errorMessage = err.error?.error || 'Error al cargar datos para gráfica. Por favor, intente nuevamente.';
      }
    });
  }


  private colorPorEstado(estado: string): string {
    switch (estado) {
      case 'en_revision': return 'orange';
      case 'confirmado': return 'green';
      case 'cancelado': return 'red';
      default: return 'gray';
    }
  }

  private crearGrafica(): void {
    // Esperar a que el DOM se actualice si se acaba de mostrar
    setTimeout(() => {
      const canvas = document.getElementById('miGrafica') as HTMLCanvasElement | null;

      if (!canvas) {
        console.error('No se encontró el elemento canvas con id "miGrafica"');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('No se pudo obtener el contexto 2D del canvas');
        return;
      }

      if (this.chart) {
        this.chart.destroy(); // Evitar duplicados
      }

      console.log('Creando gráfica con datos:', this.chartData);

      this.chart = new Chart(ctx, {
        type: 'bar',
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false, // Añadir esta opción
          scales: {
            x: {
              stacked: false
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          },
          plugins: {
            legend: {
              position: 'top'
            },
            title: {
              display: true,
              text: 'Reservas por sala y estado'
            }
          }
        }
      });
    }, 100);
  }


  toggleGrafica(): void {
    this.mostrarGrafica = !this.mostrarGrafica;

    if (this.mostrarGrafica) {
      // Siempre recargar datos al mostrar (datos actualizados)
      this.cargarDatosGrafica();
    } else {
      // Si se oculta la gráfica, destruir el chart
      if (this.chart) {
        this.chart.destroy();
        this.chart = undefined;
      }
    }
  }







}
