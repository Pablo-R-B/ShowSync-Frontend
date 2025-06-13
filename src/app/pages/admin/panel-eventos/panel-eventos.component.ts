import { Component, OnInit } from '@angular/core';
import { EventosService } from '../../../servicios/eventos.service';
import {DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoDTO } from '../../../interfaces/EventoDTO';

import {Router} from '@angular/router';

@Component({
  selector: 'app-panel-eventos',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    TitleCasePipe,
  ],
  templateUrl: './panel-eventos.component.html',
  styleUrls: ['./panel-eventos.component.css']
})
export class PanelEventosComponent implements OnInit {
  eventos: EventoDTO[] = [];
  eventosFiltrados: EventoDTO[] = [];
  eventosPaginados: EventoDTO[] = [];
  cargando: boolean = true;
  error: string | null = null;
  filtroEstado: string = 'TODOS';
  filtro: string = '';

  // Variable para navegación rápida
  paginaNavegacion: number = 1;

  // Paginación - usando solo estas variables
  paginaActual: number = 0;
  itemsPorPagina: number = 6;
  totalPaginas: number = 0;
  totalEventos: number = 0;

  constructor(private eventoService: EventosService,
              private router: Router
  ) {
    // La configuración de debounce para búsqueda se elimina, ya que no se usa la búsqueda automática
  }

  ngOnInit(): void {
    this.obtenerEventos();
  }

  obtenerEventos(): void {
    this.cargando = true;
    this.error = null;

    this.eventoService.getTodosLosEventos().subscribe({
      next: (eventos) => {this.eventos = eventos.sort((a, b) => new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime());
        this.totalEventos = this.eventos.length; // Calcular el total de eventos
        this.filtrarEventos(); // Al cargar los eventos, aplicamos los filtros iniciales
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar los eventos. Por favor, inténtelo de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  // Este método ahora se llama directamente cuando se quiere aplicar el filtro de búsqueda
  aplicarFiltroBusqueda(): void {
    this.paginaActual = 0; // Resetear a la primera página al aplicar un nuevo filtro
    this.filtrarEventos();
  }

  // Nuevo método para limpiar la búsqueda
  limpiarBusqueda(): void {
    this.filtro = ''; // Limpiar el texto del filtro
    this.filtroEstado = 'TODOS'; // Opcional: reiniciar también el filtro de estado
    this.paginaActual = 0; // Volver a la primera página
    this.filtrarEventos(); // Volver a cargar todos los eventos sin filtro
  }


  filtrarEventos(): void {
    let filtrados = this.eventos;

    if (this.filtroEstado !== 'TODOS') {
      filtrados = filtrados.filter(evento => evento.estado === this.filtroEstado);
    }

    // Este filtro se aplica ahora solo cuando se llama a aplicarFiltroBusqueda() o se cambia el estado
    if (this.filtro.trim()) {
      const filtroLower = this.filtro.toLowerCase();
      filtrados = filtrados.filter(evento =>
        evento.nombreEvento?.toLowerCase().includes(filtroLower) ||
        evento.descripcion?.toLowerCase().includes(filtroLower)
      );
    }

    this.eventosFiltrados = filtrados;

    // Calcular el total de páginas correctamente
    this.totalPaginas = Math.ceil(this.eventosFiltrados.length / this.itemsPorPagina);

    // Si la página actual es mayor que el total de páginas disponibles, resetear
    if (this.paginaActual >= this.totalPaginas) {
      this.paginaActual = Math.max(0, this.totalPaginas - 1);
    }

    this.paginaNavegacion = this.paginaActual + 1;

    this.actualizarEventosPaginados();
  }

  actualizarEventosPaginados(): void {
    const start = this.paginaActual * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    this.eventosPaginados = this.eventosFiltrados.slice(start, end);
  }

  verDetallesEvento(id: number): void {
    this.router.navigate([`/eventos/${id}`]);
    console.log('Ver detalles del evento:', id);
  }

  editarEvento(id: number): void {
    console.log('Editar evento:', id);
  }

  cancelarEvento(id: number): void {
    this.eventoService.cancelarEvento(id).subscribe({
      next: () => {
        console.log('Evento cancelado exitosamente:', id);
        this.obtenerEventos(); // Actualizar la lista de eventos
      },
      error: (err) => {
        console.error('Error al cancelar el evento:', err);
      }
    });
  }

  onFiltroChange(): void {
    // Este método se mantiene pero no tiene la lógica de debounce.
    // La acción de filtrar ahora la disparará el botón o la tecla Enter.
  }

  // Métodos de paginación
  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas || pagina === this.paginaActual) return;

    this.paginaActual = pagina;
    this.paginaNavegacion = pagina + 1; // Sincronizar la navegación rápida
    this.actualizarEventosPaginados();
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

  obtenerRangoPaginas(): number[] {
    const rango = [];
    const inicio = Math.max(0, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas - 1, this.paginaActual + 2);

    for (let i = inicio; i <= fin; i++) {
      rango.push(i);
    }
    return rango;
  }

  irAPagina(): void {
    if (this.paginaNavegacion &&
      this.paginaNavegacion >= 1 &&
      this.paginaNavegacion <= this.totalPaginas) {
      this.cambiarPagina(this.paginaNavegacion - 1);
    } else {
      // Resetear el valor si es inválido
      this.paginaNavegacion = this.paginaActual + 1;
    }
  }

  // Getters para la vista
  get esPrimeraPagina(): boolean {
    return this.paginaActual === 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual >= this.totalPaginas - 1;
  }

  get paginaActualDisplay(): number {
    return this.paginaActual + 1;
  }

  // Getter para verificar si está cargando (para compatibilidad con template)
  get isLoading(): boolean {
    return this.cargando;
  }
}
