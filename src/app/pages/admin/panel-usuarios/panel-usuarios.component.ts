import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../../interfaces/usuario';
import { UsuarioService } from '../../../servicios/usuario.service';
import { CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { PaginationParams } from '../../../servicios/salas.service';

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

  paginaActual: number = 0;
  itemsPorPagina: number = 6;
  totalUsuarios: number = 0;
  totalPaginas: number = 1;
  isLoading: boolean = false;

  private searchSubject = new Subject<string>();

  constructor(private usuarioService: UsuarioService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((termino) => {
      this.filtro = termino;
      this.paginaActual = 0; // Reiniciar a primera página al buscar
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
      size: this.itemsPorPagina,
      termino: this.filtro.trim()
    };

    this.usuarioService.obtenerTodasPaginadas(params).subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.totalUsuarios = (this.paginaActual * this.itemsPorPagina) + usuarios.length;
        this.totalPaginas = usuarios.length < this.itemsPorPagina
          ? this.paginaActual + 1
          : this.paginaActual + 2;
        this.filtrarUsuarios();
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios.';
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
    this.filtrarUsuarios();
  }

  get esPrimeraPagina(): boolean {
    return this.paginaActual === 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual + 1 >= this.totalPaginas;
  }

  paginaAnterior(): void {
    if (!this.esPrimeraPagina) {
      this.paginaActual--;
      this.cargarUsuarios();
    }
  }

  paginaSiguiente(): void {
    if (!this.esUltimaPagina) {
      this.paginaActual++;
      this.cargarUsuarios();
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina !== this.paginaActual) {
      this.paginaActual = pagina;
      this.cargarUsuarios();
    }
  }

  obtenerRangoPaginas(): number[] {
    const paginas: number[] = [];
    for (let i = 0; i < this.totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
  }
}
