import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sala } from '../../interfaces/sala';
import { SalasService } from '../../servicios/salas.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
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
  salas: Sala[] = [];
  salasFiltradas: Sala[] = [];
  salasPaginadas: Sala[] = [];
  cargando: boolean = false;

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 6;
  totalPaginas: number = 1;

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

  private filtrosSubject = new Subject<void>();

  constructor(
    private salasService: SalasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSalas();
    this.configurarDebounce();
  }

  cargarSalas(): void {
    this.cargando = true;
    this.salasService.obtenerTodas().subscribe({
      next: (salas) => {
        this.salas = salas;
        this.aplicarFiltrosYOrden();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar las salas', err);
        this.cargando = false;
      }
    });
  }

  configurarDebounce(): void {
    this.filtrosSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.aplicarFiltrosYOrden());
  }

  aplicarFiltrosYOrden(): void {
    this.aplicarFiltros();
    this.aplicarOrden();
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarSalasPaginadas();
  }

  aplicarFiltros(): void {
    const texto = this.filtros.texto.toLowerCase().trim();
    const ciudad = this.filtros.ciudad.toLowerCase().trim();
    const provincia = this.filtros.provincia.toLowerCase().trim();
    const capacidadMin = this.filtros.capacidadMin;

    this.salasFiltradas = this.salas.filter(sala => {
      const cumpleTexto = !texto ||
        sala.nombre?.toLowerCase().includes(texto) ||
        sala.descripcion?.toLowerCase().includes(texto);

      const cumpleCiudad = !ciudad ||
        sala.ciudad?.toLowerCase().includes(ciudad);

      const cumpleProvincia = !provincia ||
        sala.provincia?.toLowerCase().includes(provincia);

      const cumpleCapacidad = sala.capacidad >= capacidadMin;

      return cumpleTexto && cumpleCiudad && cumpleProvincia && cumpleCapacidad;
    });
  }

  aplicarOrden(): void {
    switch(this.ordenActual) {
      case 'nombre-asc':
        this.salasFiltradas.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        this.salasFiltradas.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
      case 'ciudad-asc':
        this.salasFiltradas.sort((a, b) => a.ciudad.localeCompare(b.ciudad));
        break;
      case 'ciudad-desc':
        this.salasFiltradas.sort((a, b) => b.ciudad.localeCompare(a.ciudad));
        break;
      case 'provincia-asc':
        this.salasFiltradas.sort((a, b) => a.provincia.localeCompare(b.provincia));
        break;
      case 'provincia-desc':
        this.salasFiltradas.sort((a, b) => b.provincia.localeCompare(a.provincia));
        break;
      case 'capacidad-asc':
        this.salasFiltradas.sort((a, b) => a.capacidad - b.capacidad);
        break;
      case 'capacidad-desc':
        this.salasFiltradas.sort((a, b) => b.capacidad - a.capacidad);
        break;
      default:
        break;
    }
  }

  cambiarOrden(nuevoOrden: string): void {
    this.ordenActual = nuevoOrden;
    this.aplicarFiltrosYOrden();
  }

  // Resto de métodos (filtros, paginación, etc.) se mantienen igual...
  hayFiltrosActivos(): boolean {
    return this.filtros.ciudad !== '' ||
      this.filtros.provincia !== '' ||
      this.filtros.capacidadMin > 0;
  }

  actualizarBusquedaTexto(): void {
    this.filtrosSubject.next();
  }

  limpiarFiltro(filtro: keyof FiltrosSala): void {
    if (filtro === 'capacidadMin') {
      this.filtros[filtro] = 0;
    } else {
      this.filtros[filtro] = '';
    }
    this.aplicarFiltrosYOrden();
  }

  limpiarTodosFiltros(): void {
    this.filtros = {
      texto: '',
      ciudad: '',
      provincia: '',
      capacidadMin: 0
    };
    this.aplicarFiltrosYOrden();
  }

  irAReservarSala(salaId: number): void {
    this.router.navigate(['/salas', salaId]);
  }

  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.salasFiltradas.length / this.itemsPorPagina);
    if (this.totalPaginas === 0) this.totalPaginas = 1;
  }

  actualizarSalasPaginadas(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.salasPaginadas = this.salasFiltradas.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarSalasPaginadas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cambiarItemsPorPagina(): void {
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarSalasPaginadas();
  }

  paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  mostrarNumeroPagina(pagina: number): boolean {
    if (pagina === 1 || pagina === this.totalPaginas) return true;
    return Math.abs(pagina - this.paginaActual) <= 1;
  }

  mostrarPuntosSuspensivos(pagina: number): boolean {
    if (pagina === this.totalPaginas) return false;
    return !this.mostrarNumeroPagina(pagina) && this.mostrarNumeroPagina(pagina + 1);
  }
}
