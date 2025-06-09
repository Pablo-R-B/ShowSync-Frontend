import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { PromotoresService } from '../../servicios/promotores.service';
import { Promotor } from '../../interfaces/Promotor';
import { Page } from '../../interfaces/Page';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-busqueda-promotores',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    RouterLink
  ],
  templateUrl: './busqueda-promotores.component.html',
  styleUrls: ['./busqueda-promotores.component.css']
})
export class BusquedaPromotoresComponent implements OnInit {
  promotores: Promotor[] = [];
  nombrePromotorSeleccionado: string = '';
  totalPaginas: number = 0;
  paginaActual: number = 0;
  pageSize: number = 6;
  totalItems: number = 0;
  paginaNavegacion: number = 1;
  isLoading: boolean = true;

  constructor(private promotoresService: PromotoresService) {}

  ngOnInit(): void {
    this.cargarPromotores();
  }

  cargarPromotores(): void {
    console.log('Cargando promotores con parámetros:', {
      page: this.paginaActual,
      size: this.pageSize,
      nombre: this.nombrePromotorSeleccionado
    });
    this.isLoading = true;
    this.promotoresService.obtenerPromotoresPaginados(
      this.paginaActual,
      this.pageSize,
      this.nombrePromotorSeleccionado // Este parámetro puede ser undefined inicialmente
    ).subscribe({

      next: (data) => {
        console.log('Datos recibidos:', data);

        this.promotores = data.content;
        this.totalItems = data.totalElements;
        this.totalPaginas = data.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar promotores:', error);
        if (error.error) {
          console.error('Detalles del error:', error.error);
        }
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.paginaActual = 0;
    this.cargarPromotores();
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.paginaActual = pagina;
    this.cargarPromotores();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaSiguiente(): void {
    if (!this.esUltimaPagina) {
      this.cambiarPagina(this.paginaActual + 1);
    }
  }

  paginaAnterior(): void {
    if (!this.esPrimeraPagina) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  irAPagina(): void {
    const pagina = Number(this.paginaNavegacion);
    if (!isNaN(pagina)) {
      const paginaIndex = Math.max(0, Math.min(pagina - 1, this.totalPaginas - 1));
      this.cambiarPagina(paginaIndex);
    }
  }

  get paginaActualDisplay(): number {
    return this.paginaActual + 1;
  }

  get esPrimeraPagina(): boolean {
    return this.paginaActual === 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual >= this.totalPaginas - 1;
  }

  getPaginasMostradas(): number[] {
    const paginasAMostrar = 5;
    let inicio = Math.max(0, this.paginaActual - Math.floor(paginasAMostrar / 2));
    let fin = Math.min(this.totalPaginas - 1, inicio + paginasAMostrar - 1);

    if (fin - inicio + 1 < paginasAMostrar) {
      inicio = Math.max(0, fin - paginasAMostrar + 1);
    }

    return Array.from({ length: fin - inicio + 1 }, (_, i) => inicio + i);
  }

  getShortDescription(description: string): string {
    if (!description) {
      return 'Sin descripción disponible';
    }

    const words = description.split(' ');
    if (words.length <= 10) {
      return description;
    }

    return words.slice(0, 10).join(' ') + '...';
  }
}
