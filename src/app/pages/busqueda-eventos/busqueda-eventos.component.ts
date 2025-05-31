import { Router } from '@angular/router';
import {Component, NgIterable, OnInit} from '@angular/core';
import { NgClass, NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { EventosService } from '../../servicios/eventos.service';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
import {Paginator} from 'primeng/paginator';
import {filtroEvento} from '../../interfaces/filtroEvento';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-busqueda-eventos',
  templateUrl: './busqueda-eventos.component.html',
  styleUrls: ['./busqueda-eventos.component.css'],
  standalone: true,
  imports: [
    TitleCasePipe,
    NgForOf,
    NgIf,
    NgClass,
    FormsModule,
    Paginator
  ]
})
export class BusquedaEventosComponent implements OnInit {
  mostrarModal = false;

  eventos: any[] = [];
  eventosFiltrados: any[] = [];
  eventosOriginales: any[] = [];

  generos: string[] = [];
  estados: string[] = [];

  generoSeleccionado: string = '';
  estadoSeleccionado: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';

  pageSize: number = 6;
  totalItems: number = 0;
  paginaActual: number = 0;
  eventosPaginados: any[] = [];


  filtro: filtroEvento = {
    texto: '',
    nombre: '',
    generosMusicales: '',
    estado: '',

  };
  private filtrosSubject = new Subject<void>(); // Inicialización correcta

  constructor(
    private eventosService: EventosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
    this.cargarGeneros();
  }

  get usuarioLogueado(): boolean {
    return this.authService.isLoggedIn();
  }

  cargarEventos(): void {
    this.eventosService.getTodosLosEventos().subscribe({
      next: (data) => {
        this.eventosOriginales = [...data];
        this.eventosFiltrados = [...data];
        this.totalItems = this.eventosFiltrados.length;
        this.actualizarEventosPaginados();
        this.estados = [...new Set(data.map((e: any) => e.estado))];
      },
      error: (err) => {
        console.error('Error al cargar los eventos', err);
      }
    });
  }

  aplicarFiltros(): void {
    this.eventosFiltrados = this.eventosOriginales.filter((evento) => {
      const cumpleTexto =
        !this.filtro.texto ||
        evento.nombreEvento?.toLowerCase().includes(this.filtro.texto.toLowerCase()) ||
        evento.descripcion?.toLowerCase().includes(this.filtro.texto.toLowerCase());

      const cumpleGenero =
        this.generoSeleccionado === '' ||
        (evento.generosMusicales || []).some((genero: string) =>
          genero.toLowerCase().trim() === this.generoSeleccionado.toLowerCase().trim()
        );

      let fechaEvento: Date;
      if (Array.isArray(evento.fechaEvento)) {
        const [anio, mes, dia] = evento.fechaEvento;
        fechaEvento = new Date(anio, mes - 1, dia);
      } else {
        fechaEvento = new Date(evento.fechaEvento);
      }

      const cumpleFechaDesde =
        !this.fechaDesde || fechaEvento >= new Date(this.fechaDesde);

      const cumpleFechaHasta =
        !this.fechaHasta || fechaEvento <= new Date(this.fechaHasta);

      const cumpleEstado =
        this.estadoSeleccionado === '' ||
        (evento.estado && evento.estado.toLowerCase().includes(this.estadoSeleccionado.toLowerCase()));

      return cumpleTexto && cumpleGenero && cumpleFechaDesde && cumpleFechaHasta && cumpleEstado;
    });

    this.totalItems = this.eventosFiltrados.length;
    this.paginaActual = 0;
    this.actualizarEventosPaginados();
  }



  actualizarEventosPaginados(): void {
    const start = this.paginaActual * this.pageSize;
    const end = start + this.pageSize;
    this.eventosPaginados = this.eventosFiltrados.slice(start, end);

  }

  hayFiltrosActivos(): boolean {

    return (
      !!this.filtro.texto ||
      !!this.generoSeleccionado ||
      !!this.estadoSeleccionado ||
      !!this.fechaDesde ||
      !!this.fechaHasta
    );
  }

  limpiarFiltro(campo: string): void {
    (this as any)[campo] = '';
    this.aplicarFiltros();
  }

  limpiarTodosFiltros(): void {
    this.filtro.texto = '';
    this.generoSeleccionado = '';
    this.estadoSeleccionado = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.aplicarFiltros();
  }


  onPageChange(event: any): void {
    this.paginaActual = event.page;
    this.pageSize = event.rows;
    this.actualizarEventosPaginados();
  }


  verInfo(evento: any): void {
    if (!evento?.id) return;
    if (!this.usuarioLogueado) {
      this.mostrarAdvertencia();
      return;
    }
    this.router.navigate([`/eventos/${evento.id}`]);
  }

  seguirEvento(evento: any): void {
    if (!this.usuarioLogueado) {
      this.mostrarModal = true;
      return;
    }

    evento.seguido = !evento.seguido;
    this.eventosService.actualizarSeguimiento(evento.id, evento.seguido).subscribe({
      next: () => {
        console.log(`Evento ${evento.seguido ? 'seguido' : 'dejado de seguir'}`);
      },
      error: (error) => {
        console.error('Error al actualizar el seguimiento:', error);
        evento.seguido = !evento.seguido;
      }
    });
  }

  mostrarAdvertencia(): void {
    this.mostrarModal = true;
    setTimeout(() => this.cerrarModal(), 3000);
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  formatearFecha(fecha: number[]): string {
    if (!fecha || fecha.length < 3) return '';
    const [anio, mes, dia] = fecha;
    return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;
  }

  private cargarGeneros() {
    this.eventosService.getGeneros().subscribe({
      next: (data) => this.generos = data,
      error: (err) => console.error('Error al cargar los géneros', err)
    });
  }

  actualizarBusquedaTexto(): void {
    this.filtrosSubject.next();
  }
}
