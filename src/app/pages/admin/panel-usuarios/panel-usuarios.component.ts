import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../../interfaces/usuario';
import { UsuarioService } from '../../../servicios/usuario.service';
import { CommonModule, DatePipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

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
  cargando: boolean = true;
  error: string | null = null;

  filtroRol: string = 'TODOS';
  filtro: string = '';
  paginaNavegacion: number = 1;
  paginaActual: number = 0;
  itemsPorPagina: number = 6;
  totalUsuarios: number = 0;
  totalPaginas: number = 1;

  private searchSubject = new Subject<string>();

  constructor(private usuarioService: UsuarioService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((termino) => {
      this.filtro = termino;
      this.resetearPaginacion();
      this.cargarUsuarios();
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  private resetearPaginacion(): void {
    this.paginaActual = 0;
    this.paginaNavegacion = 1;
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;

    const params = {
      page: this.paginaActual,
      size: this.itemsPorPagina,
      termino: this.filtro?.trim() || undefined,
      rol: this.filtroRol !== 'TODOS' ? this.filtroRol : undefined
    };

    console.log('Enviando parámetros:', params);

    this.usuarioService.obtenerTodasPaginadas(params).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);

        // Manejar tanto respuesta paginada como array simple
        if (response && (response.items || Array.isArray(response))) {
          this.usuarios = response.items || response;
          this.totalUsuarios = response.totalItems || response.length;
          this.totalPaginas = response.totalPages || Math.ceil(this.totalUsuarios / this.itemsPorPagina);
        } else {
          this.usuarios = [];
          this.totalUsuarios = 0;
          this.totalPaginas = 1;
        }

        console.log('Datos asignados:', {
          usuarios: this.usuarios.length,
          total: this.totalUsuarios,
          paginas: this.totalPaginas
        });
      },
      error: (err) => {
        console.error('Error:', err);
        this.usuarios = [];
        this.totalUsuarios = 0;
        this.totalPaginas = 1;
      },
      complete: () => {
        this.cargando = false;
        console.log('Carga completada');
      }
    });
  }

  onFiltroTextoChange(): void {
    this.searchSubject.next(this.filtro);
  }

  onFiltroRolChange(): void {
    this.resetearPaginacion();
    this.cargarUsuarios();
  }

  cambiarPagina(pagina: number): void {
    console.log('Intentando cambiar a página:', pagina);
    if (pagina >= 0 && pagina < this.totalPaginas && pagina !== this.paginaActual) {
      this.paginaActual = pagina;
      this.paginaNavegacion = pagina + 1;
      console.log('Cargando página:', this.paginaActual);
      this.cargarUsuarios();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.warn('Cambio de página no permitido');
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



  get isLoading(): boolean {
    return this.cargando;
  }



}
