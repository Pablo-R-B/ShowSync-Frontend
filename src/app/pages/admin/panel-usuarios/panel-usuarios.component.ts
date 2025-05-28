import {Component, OnInit} from '@angular/core';
import {Usuario} from '../../../interfaces/usuario';
import {UsuarioService} from '../../../servicios/usuario.service';
import {CommonModule, DatePipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-panel-usuarios',
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
  filtroRol: string = 'TODOS';
  cargando: boolean = true;
  error: string | null = null;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(): void {
    this.cargando = true;
    this.error = null;

    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios.';
        this.cargando = false;
      }
    });
  }

  get usuariosFiltrados(): Usuario[] {
    if (this.filtroRol === 'TODOS') return this.usuarios;
    return this.usuarios.filter(u => u.rol === this.filtroRol);
  }
}
