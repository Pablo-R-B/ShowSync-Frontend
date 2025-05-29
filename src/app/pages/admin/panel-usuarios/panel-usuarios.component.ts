import {Component, OnInit} from '@angular/core';
import {Usuario} from '../../../interfaces/usuario';
import {UsuarioService} from '../../../servicios/usuario.service';
import {CommonModule, DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {debounceTime, distinctUntilChanged, Subject} from 'rxjs';

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

  private searchSubject = new Subject<string>();

  constructor(private usuarioService: UsuarioService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((termino) => {
      this.buscarConDebounce(termino);
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.cargando = true;
    this.error = null;

    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.filtrarUsuarios();
        this.cargando = false;
      },
      error: (err) => {
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

    if (this.filtro.trim()) {
      const filtroLower = this.filtro.toLowerCase();
      filtrados = filtrados.filter(u =>
        u.nombreUsuario?.toLowerCase().includes(filtroLower) ||
        u.email?.toLowerCase().includes(filtroLower)
      );
    }

    this.usuariosFiltrados = filtrados;
  }

  onFiltroTextoChange(): void {
    this.searchSubject.next(this.filtro);
  }

  buscarConDebounce(termino: string): void {
    this.filtro = termino;
    this.filtrarUsuarios();
  }

  onFiltroRolChange(): void {
    this.filtrarUsuarios();
  }
}
