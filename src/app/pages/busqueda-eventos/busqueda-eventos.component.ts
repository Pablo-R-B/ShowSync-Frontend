import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf, TitleCasePipe } from '@angular/common';
import { EventosService } from '../../servicios/EventosService';
import { AuthService } from '../../servicios/auth.service';
import { FormsModule } from '@angular/forms';

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
    FormsModule
  ]
})
export class BusquedaEventosComponent implements OnInit {
  mostrarModal = false;

  eventos: any[] = [];
  eventosFiltrados: any[] = [];

  generos: string[] = [];
  estados: string[] = [];

  // Filtros
  generoSeleccionado: string = '';
  estadoSeleccionado: string = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  private eventosOriginales: any[] = []; // ✅ Inicializado como array vacío

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
        this.eventos = data;
        this.eventosOriginales = [...data]; // ✅ Guardar copia original
        this.eventosFiltrados = [...data];

        // Extrae valores únicos para los filtros
        this.estados = [...new Set(data.map((e: any) => e.estado))];
      },
      error: (err) => {
        console.error('Error al cargar los eventos', err);
      }
    });
  }

  aplicarFiltros(): void {
    if (!Array.isArray(this.eventosOriginales)) {
      this.eventosFiltrados = [];
      return;
    }

    console.log('Género seleccionado:', this.generoSeleccionado);

    this.eventosFiltrados = this.eventosOriginales.filter((evento: {
      generosMusicales: string[];
      fechaEvento: number[]; // Asegurarnos de que la fecha es un arreglo
      estado: string;
    }) => {
      // Verificar si el evento tiene generosMusicales
      const generosMusicales = evento.generosMusicales || [];

      // Verificar si el evento tiene el género seleccionado en generosMusicales
      const cumpleGenero =
        this.generoSeleccionado === '' ||
        generosMusicales.some(genero =>
          genero.toLowerCase().trim() === this.generoSeleccionado.toLowerCase().trim()
        );

      console.log('Evento generosMusicales:', generosMusicales, 'cumpleGenero:', cumpleGenero);

      // Construir la fecha correctamente a partir del arreglo [año, mes, día]
      let fechaEvento: Date;

      // Verificar si la fecha es un arreglo [año, mes, día]
      if (Array.isArray(evento.fechaEvento)) {
        const [anio, mes, dia] = evento.fechaEvento;

        // Validar que mes esté en el rango 1-12, y que la fecha no sea inválida
        if (mes >= 1 && mes <= 12 && dia > 0 && dia <= 31) {
          fechaEvento = new Date(anio, mes - 1, dia); // Mes en JS es 0-indexado
        } else {
          fechaEvento = new Date(NaN); // Si el mes o el día no son válidos, asignamos una fecha inválida
        }
      } else {
        fechaEvento = new Date(evento.fechaEvento); // Si es un string o número, lo intentamos convertir directamente
      }

      console.log('Fecha evento:', fechaEvento);

      // Validar si la fecha es válida
      if (isNaN(fechaEvento.getTime())) {
        console.error('Fecha inválida:', evento.fechaEvento);
        fechaEvento = new Date(NaN); // Asignamos una fecha inválida si no es válida
      }

      // Validar rango de fechas
      const cumpleFechaDesde =
        !this.fechaDesde || fechaEvento >= new Date(this.fechaDesde);

      const cumpleFechaHasta =
        !this.fechaHasta || fechaEvento <= new Date(this.fechaHasta);

      console.log('cumpleFechaDesde:', cumpleFechaDesde, 'cumpleFechaHasta:', cumpleFechaHasta);

      // Validar estado
      const cumpleEstado =
        this.estadoSeleccionado === '' ||
        (evento.estado && evento.estado.toLowerCase().includes(this.estadoSeleccionado.toLowerCase()));

      return cumpleGenero && cumpleFechaDesde && cumpleFechaHasta && cumpleEstado;
    });

    console.log('Eventos filtrados:', this.eventosFiltrados);
  }



  verInfo(evento: any): void {
    if (!evento || !evento.id) return;
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
        evento.seguido = !evento.seguido; // Revertir si falla
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
}
