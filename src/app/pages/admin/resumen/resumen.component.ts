import { Component, OnInit } from '@angular/core';
import { SalaEstadoCantidad } from '../../../interfaces/SalaEstadoCantidad';
import { UsuarioService } from '../../../servicios/usuario.service';
import { SalasService } from '../../../servicios/salas.service';
import { EventosService } from '../../../servicios/eventos.service';
import { NgForOf, TitleCasePipe, NgClass, DecimalPipe } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  imports: [
    TitleCasePipe,
    NgForOf,
    NgClass,
    DecimalPipe
  ],
  styleUrls: ['./resumen.component.css'],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-in')
      ])
    ]),
    trigger('countUp', [
      transition('* => *', [
        animate('800ms ease-out')
      ])
    ])
  ]
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
  totalSalasExistentes: number = 0;

  // Datos de eventos
  totalEventos: number = 0;
  eventosFuturos: number = 0;
  eventosPasados: number = 0;


  // Estados de carga
  loadingUsuarios: boolean = true;
  loadingSalas: boolean = true;
  loadingEventos: boolean = true;

  // Datos calculados
  porcentajeEventosFuturos: number = 0;
  tendenciaUsuarios: string = 'stable';
  protected totalSalasReservadas: number | undefined;

  constructor(
    private usuarioService: UsuarioService,
    private salasService: SalasService,
    private eventosService: EventosService
  ) {}

  ngOnInit(): void {
    this.cargarTodosLosDatos();
    this.salasExistentes(); // Llamada al método


  }

  async cargarTodosLosDatos(): Promise<void> {
    try {
      await Promise.all([
        this.cargarUsuariosPorRol(),
        this.cargarDatosSalas(),
        this.cargarDatosEventos()
      ]);
      this.calcularMetricasAdicionales();
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    }
  }

  cargarUsuariosPorRol(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.usuarioService.contarUsuariosPorRol().subscribe({
        next: (data: any) => {
          this.totalUsuarios = data.totalUsuarios || 0;
          this.totalArtistas = data.Artistas || 0;
          this.totalPromotores = data.Promotores || 0;
          this.totalAdministradores = data.Administrador || 0;
          this.loadingUsuarios = false;
          resolve();
        },
        error: (err) => {
          console.error('Error usuarios:', err);
          this.loadingUsuarios = false;
          reject(err);
        }
      });
    });
  }

  cargarDatosSalas(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.salasService.getDatosGraficaSalas().subscribe({
        next: (data: SalaEstadoCantidad[]) => {
          this.datosSalas = data;
          this.calcularTotalesPorEstado();
          this.loadingSalas = false;
          resolve();
        },
        error: (err) => {
          console.error('Error salas:', err);
          this.loadingSalas = false;
          reject(err);
        }
      });
    });
  }

  cargarDatosEventos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.eventosService.obtenerTotalEventos().subscribe({
        next: (data: any) => {
          this.totalEventos = data.total || 0;
          this.eventosFuturos = data.futuros || 0;
          this.eventosPasados = data.pasados || 0;

          this.loadingEventos = false;
          resolve();
        },
        error: (err) => {
          console.error('Error eventos:', err);
          this.loadingEventos = false;
          reject(err);
        }
      });
    });
  }

  calcularTotalesPorEstado(): void {
    const salasUnicas = Array.from(new Set(this.datosSalas.map(item => item.salaNombre)));

    this.salasEnRevision = salasUnicas
      .filter(salaNombre => this.datosSalas.some(item => item.salaNombre === salaNombre && item.estado === 'en_revision'))
      .length;

    this.salasConfirmadas = salasUnicas
      .filter(salaNombre => this.datosSalas.some(item => item.salaNombre === salaNombre && item.estado === 'confirmado'))
      .length;

    this.salasRechazadas = salasUnicas
      .filter(salaNombre => this.datosSalas.some(item => item.salaNombre === salaNombre && item.estado === 'cancelado'))
      .length;

    this.totalSalasReservadas = salasUnicas
      .filter(salaNombre => this.datosSalas.some(item => salaNombre === item.salaNombre && ['en_revision', 'confirmado'].includes(item.estado)))
      .length;

    console.log('Total de salas reservadas:', this.totalSalasReservadas);
  }
  calcularMetricasAdicionales(): void {
    // Calcular porcentaje de eventos futuros que se hayan 'confirmado' únicamente
    if (this.totalEventos > 0) {
      this.porcentajeEventosFuturos = (this.salasConfirmadas / this.totalEventos) * 100;
    }

    // Simular tendencia de usuarios (esto debería venir del backend)
    this.tendenciaUsuarios = this.totalUsuarios > 100 ? 'up' : 'stable';
  }



  // Método para trackBy en ngFor (mejora performance)
  trackBySala(index: number, item: SalaEstadoCantidad): string {
    return item.salaNombre + item.estado;
  }

  // Métodos auxiliares para el template
  get totalSalas(): number {
    return this.datosSalas.length;
  }

  get porcentajeConfirmadas(): number {
    return this.totalSalas > 0 ? (this.salasConfirmadas / this.totalSalas) * 100 : 0;
  }

  get porcentajeEnRevision(): number {
    return this.totalSalas > 0 ? (this.salasEnRevision / this.totalSalas) * 100 : 0;
  }

  get porcentajeRechazadas(): number {
    return this.totalSalas > 0 ? (this.salasRechazadas / this.totalSalas) * 100 : 0;
  }

  // Método para obtener el color del estado
  getEstadoColor(estado: string): string {
    const colores = {
      'en_revision': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'confirmado': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'cancelado': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colores[estado as keyof typeof colores] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';  }

  // Método para refrescar datos
  refrescarDatos(): void {
    this.loadingUsuarios = true;
    this.loadingSalas = true;
    this.loadingEventos = true;
    this.cargarTodosLosDatos();
  }


  // Método para obtener el total de salas existentes
    salasExistentes(): void {
      this.salasService.obtenerTotalSalas().subscribe({
        next: (total: number) => {
          this.totalSalasExistentes = total;
        },
        error: (err) => {
          console.error('Error al obtener el total de salas existentes:', err);
        }
      });
    }
}
