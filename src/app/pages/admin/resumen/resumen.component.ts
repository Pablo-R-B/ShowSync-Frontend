import { Component, OnInit } from '@angular/core';
import {SalaEstadoCantidad} from '../../../interfaces/SalaEstadoCantidad';
import {UsuarioService} from '../../../servicios/usuario.service';
import {SalasService} from '../../../servicios/salas.service';
import {NgForOf, TitleCasePipe} from '@angular/common';


@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  imports: [
    TitleCasePipe,
    NgForOf
  ],
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  // Datos existentes
  totalUsuarios: number = 0;
  totalEventos: number = 0;
  totalSalas: number = 0;
  totalArtistas: number = 0;
  totalPromotores: number = 0;
  totalAdministradores: number = 0;

  // Nuevos datos para salas por estado
  datosSalas: SalaEstadoCantidad[] = [];
  salasEnRevision: number = 0;
  salasConfirmadas: number = 0;
  salasRechazadas: number = 0;

  constructor(private usuarioService: UsuarioService, private salasService: SalasService) {}
  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarUsuariosPorRol();
    this.cargarDatosSalas();
  }

  cargarEstadisticas(): void {
    // Simulación de otros datos
    this.totalEventos = 45;
    this.totalSalas = 10;
  }

  cargarUsuariosPorRol(): void {
    this.usuarioService.contarUsuariosPorRol().subscribe({
      next: (data: any) => {
        this.totalUsuarios = data.totalUsuarios || 0;
        this.totalArtistas = data.Artistas || 0;
        this.totalPromotores = data.Promotores || 0;
        this.totalAdministradores = data.Administrador || 0;
      },
      error: (err: any) => console.error('Error usuarios:', err)
    });
  }

  cargarDatosSalas(): void {
    this.salasService.getDatosGraficaSalas().subscribe({
      next: (data: SalaEstadoCantidad[]) => {
        this.datosSalas = data;
        this.calcularTotalesPorEstado();
      },
      error: (err: any) => console.error('Error salas:', err)
    });
  }

  calcularTotalesPorEstado(): void {
    this.salasEnRevision = this.datosSalas
      .filter(item => item.estado === 'en_revision')
      .reduce((sum, item) => sum + item.cantidad, 0);

    this.salasConfirmadas = this.datosSalas
      .filter(item => item.estado === 'confirmado')
      .reduce((sum, item) => sum + item.cantidad, 0);

    this.salasRechazadas = this.datosSalas
      .filter(item => item.estado === 'cancelado') // Añade si existe este estado
      .reduce((sum, item) => sum + item.cantidad, 0);
  }
}
