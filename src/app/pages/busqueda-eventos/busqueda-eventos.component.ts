import { Router } from '@angular/router';
import {Component, NgIterable, OnInit} from '@angular/core';
import { NgClass, NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { EventosService } from '../../servicios/eventos.service';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';
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

  pageSize: number = 12;
  totalItems: number = 0;
  paginaActual: number = 0;
  eventosPaginados: any[] = [];

  totalPaginas: number = 0;
  paginaNavegacion: number = 1;




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
        this.actualizarEventosPaginados();
        this.estados = [...new Set(data.map((e: any) => e.estado))];
        this.totalItems = this.eventosFiltrados.length;
        this.totalPaginas = Math.ceil(this.totalItems / this.pageSize); // Calcular total de páginas
        this.actualizarEventosPaginados();
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
    this.totalPaginas = Math.ceil(this.totalItems / this.pageSize); // Calcular total de páginas
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

// Métodos de paginación
  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.paginaActual = pagina;
    this.paginaNavegacion = pagina + 1;
    this.cargarEventos();
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
    this.cargarEventos()
  }

  irAPagina(): void {
    if (this.paginaNavegacion && this.paginaNavegacion >= 1 && this.paginaNavegacion <= this.totalPaginas) {
      this.cambiarPagina(this.paginaNavegacion - 1);
    } else {
      this.paginaNavegacion = this.paginaActual + 1;
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



  get paginaActualDisplay(): number {
    return this.paginaActual + 1;
  }


  get esPrimeraPagina(): boolean {
    return this.paginaActual === 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual >= this.totalPaginas - 1;
  }


}
