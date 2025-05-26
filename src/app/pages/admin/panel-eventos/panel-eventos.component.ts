import { Component, OnInit } from '@angular/core';
import { EventosService } from '../../../servicios/eventos.service';
import {DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventoDTO } from '../../../interfaces/EventoDTO';

@Component({
  selector: 'app-panel-eventos',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    TitleCasePipe
  ],
  templateUrl: './panel-eventos.component.html',
  styleUrls: ['./panel-eventos.component.css']
})
export class PanelEventosComponent implements OnInit {
  eventos: EventoDTO[] = [];
  eventosFiltrados: EventoDTO[] = [];
  cargando: boolean = true;
  error: string | null = null;
  filtroEstado: string = 'TODOS';

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 1;

  constructor(private eventoService: EventosService) {}

  ngOnInit(): void {
    this.obtenerEventos();
  }

  obtenerEventos(): void {
    this.cargando = true;
    this.error = null;

    this.eventoService.getTodosLosEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos;
        this.filtrarEventos();
        this.cargando = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar los eventos. Por favor, inténtelo de nuevo más tarde.';
        this.cargando = false;
      }
    });
  }

  filtrarEventos(): void {
    if (this.filtroEstado === 'TODOS') {
      this.eventosFiltrados = [...this.eventos];
    } else {
      this.eventosFiltrados = this.eventos.filter(evento => evento.estado === this.filtroEstado);
    }
    this.paginaActual = 1;
    this.calcularPaginas();
  }

  calcularPaginas(): void {
    this.totalPaginas = Math.ceil(this.eventosFiltrados.length / this.itemsPorPagina) || 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  get eventosPaginados(): EventoDTO[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.eventosFiltrados.slice(inicio, fin);
  }

  verDetallesEvento(id: number): void {
    // Implementar lógica para ver detalles del evento
    console.log('Ver detalles del evento:', id);
  }

  editarEvento(id: number): void {
    // Implementar lógica para editar evento
    console.log('Editar evento:', id);
  }

  cancelarEvento(id: number): void {
    // Implementar lógica para cancelar evento
    console.log('Cancelar evento:', id);
    // Ejemplo de implementación:
    /*
    if (confirm('¿Está seguro de que desea cancelar este evento?')) {
      this.eventoService.cancelarEvento(id).subscribe({
        next: () => {
          this.obtenerEventos();
        },
        error: (err) => {
          this.error = 'Error al cancelar el evento';
        }
      });
    }
    */
  }

  // Métodos para la paginación
  paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  mostrarNumeroPagina(pagina: number): boolean {
    return Math.abs(pagina - this.paginaActual) <= 2 ||
      pagina === 1 ||
      pagina === this.totalPaginas;
  }

  mostrarPuntosSuspensivos(pagina: number): boolean {
    return (pagina === 2 && this.paginaActual > 4) ||
      (pagina === this.totalPaginas - 1 && this.paginaActual < this.totalPaginas - 3);
  }
}
