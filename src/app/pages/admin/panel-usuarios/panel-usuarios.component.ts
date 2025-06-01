import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../../interfaces/usuario';
import { UsuarioService } from '../../../servicios/usuario.service';
import { CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import {PaginationParams} from '../../../interfaces/PaginationParams';

@Component({
  selector: 'app-panel-usuarios',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    NgIf,
    NgForOf,
    RouterModule,
    CommonModule
  ],
  templateUrl: './panel-usuarios.component.html',
  styleUrl: './panel-usuarios.component.css'
})
export class PanelUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  filtroRol: string = 'TODOS';
  filtro: string = '';
  cargando: boolean = true;
  error: string | null = null;

  paginaNavegacion: number = 1;
  paginaActual: number = 0;
  itemsPorPagina: number = 10;
  totalUsuarios: number = 0;
  totalPaginas: number = 1;

  private searchSubject = new Subject<string>();

  constructor(private usuarioService: UsuarioService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((termino) => {
      this.filtro = termino;
      this.paginaActual = 0;
      this.paginaNavegacion = 1;
      this.cargarUsuarios();
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;

    const params: PaginationParams = {
      page: this.paginaActual,
      size: this.itemsPorPagina
    };

    if (this.filtro && this.filtro.trim() !== '') {
      params.termino = this.filtro.trim();
    }

    if (this.filtroRol !== 'TODOS') {
      params.rol = this.filtroRol.trim();
    }


    console.log('Params enviados al backend:', params);

    this.usuarioService.obtenerTodasPaginadas(params).subscribe({
      next: (response) => {
        this.usuarios = response.items;
        this.totalUsuarios = response.totalItems;
        this.totalPaginas = response.totalPages;
        this.usuariosFiltrados = [...this.usuarios]; // Ya vienen filtrados
        this.cargando = false;
        // Debug
        console.log('Usuarios cargados:', this.usuarios.length);
        console.log('Usuarios filtrados:', this.usuariosFiltrados.length);
        console.log('Total usuarios:', this.totalUsuarios);
        console.log('Total páginas:', this.totalPaginas);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = err.message || 'Error al cargar usuarios.';
        this.usuarios = [];
        this.usuariosFiltrados = [];
        this.cargando = false;
      }
    });
  }

  filtrarUsuarios(): void {
    let filtrados = this.usuarios;
    if (this.filtroRol !== 'TODOS') {
      filtrados = filtrados.filter(u => u.rol === this.filtroRol);
    }
    this.usuariosFiltrados = filtrados;
  }

  onFiltroTextoChange(): void {
    this.searchSubject.next(this.filtro);
  }

  onFiltroRolChange(): void {
    this.paginaActual = 0;
    this.paginaNavegacion = 1;
    this.cargarUsuarios();
  }

  cambiarPagina(pagina: number): void {
    if (pagina !== this.paginaActual && pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.paginaNavegacion = pagina + 1;
      this.cargarUsuarios();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  paginaAnterior(): void {
    if (!this.esPrimeraPagina) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  paginaSiguiente(): void {
    if (!this.esUltimaPagina) {
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
      this.paginaNavegacion = this.paginaActual + 1;
    }
  }

  get esPrimeraPagina(): boolean {
    return this.paginaActual === 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual >= this.totalPaginas - 1;
  }

  get paginaActualDisplay(): number {
    return this.paginaActual + 1;
  }

  get isLoading(): boolean {
    return this.cargando;
  }
}
