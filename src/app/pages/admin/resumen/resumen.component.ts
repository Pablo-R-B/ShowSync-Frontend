import { Component, OnInit } from '@angular/core';
import { SalaEstadoCantidad } from '../../../interfaces/SalaEstadoCantidad';
import { UsuarioService } from '../../../servicios/usuario.service';
import { SalasService } from '../../../servicios/salas.service';
import { EventosService } from '../../../servicios/eventos.service'; // Nuevo servicio
import { NgForOf, TitleCasePipe } from '@angular/common';

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
  // Datos de usuarios
  totalUsuarios: number = 0;
  totalArtistas: number = 0;
  totalPromotores: number = 0;
  totalAdministradores: number = 0;

  // Datos de salas
  datosSalas: SalaEstadoCantidad[] = [];
  salasEnRevision: number = 0;
  salasConfirmadas: number = 0;
  salasRechazadas: number = 0;

  // Datos de eventos
  totalEventos: number = 0;
  eventosFuturos: number = 0;
  eventosPasados: number = 0;

  constructor(
    private usuarioService: UsuarioService,
    private salasService: SalasService,
    private eventosService: EventosService // Nuevo servicio
  ) {}

  ngOnInit(): void {
    this.cargarUsuariosPorRol();
    this.cargarDatosSalas();
    this.cargarDatosEventos(); // Nueva función
  }

  cargarUsuariosPorRol(): void {
    this.usuarioService.contarUsuariosPorRol().subscribe({
      next: (data: any) => {
        this.totalUsuarios = data.totalUsuarios || 0;
        this.totalArtistas = data.Artistas || 0;
        this.totalPromotores = data.Promotores || 0;
        this.totalAdministradores = data.Administrador || 0;
      },
      error: (err) => console.error('Error usuarios:', err)
    });
  }

  cargarDatosSalas(): void {
    this.salasService.getDatosGraficaSalas().subscribe({
      next: (data: SalaEstadoCantidad[]) => {
        this.datosSalas = data;
        this.calcularTotalesPorEstado();
      },
      error: (err) => console.error('Error salas:', err)
    });
  }

  cargarDatosEventos(): void {
    this.eventosService.obtenerTotalEventos().subscribe({
      next: (data: any) => {
        this.totalEventos = data.total || 0;
        this.eventosFuturos = data.futuros || 0;
        this.eventosPasados = data.pasados || 0;
      },
      error: (err) => console.error('Error eventos:', err)
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
      .filter(item => item.estado === 'cancelado')
      .reduce((sum, item) => sum + item.cantidad, 0);
  }
}
