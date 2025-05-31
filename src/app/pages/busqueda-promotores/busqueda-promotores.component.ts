import {Component, NgIterable, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {PromotoresService} from '../../servicios/promotores.service';
import {Promotor} from '../../interfaces/Promotor';
import {RouterLink} from '@angular/router';
import {Paginator} from 'primeng/paginator';




@Component({
  selector: 'app-busqueda-promotores',
  imports: [
    FormsModule,
    NgForOf,
    RouterLink,
    Paginator
  ],
  templateUrl: './busqueda-promotores.component.html',
  styleUrl: './busqueda-promotores.component.css'
})
export class BusquedaPromotoresComponent implements OnInit {
  promotoras: Promotor[] = [];
  nombrePromotoraSeleccionada: string = '';
  promotorasFiltradas: Promotor[] = []

  pageSize: number = 6;
  totalItems: number = 0;
  paginaActual: number = 0;
  eventosPaginados: any[] = [];

  constructor(private promotoresService: PromotoresService) {}

  ngOnInit(): void {
    this.cargarPromotoras();
  }

  cargarPromotoras(): void {
    this.promotoresService.obtenerPromotorasPaginadas(this.paginaActual, this.pageSize).subscribe(data => {
      this.promotoras = data.content;
      this.totalItems = data.totalElements;
      this.promotorasFiltradas = [...this.promotoras];
    });
  }

  aplicarFiltros(): void {
    const filtro = this.nombrePromotoraSeleccionada.toLowerCase();
    this.promotorasFiltradas = this.promotoras.filter(p =>
      p.nombrePromotor.toLowerCase().includes(filtro)
    );
  }

  onPageChange(event: any): void {
    this.paginaActual = event.page;
    this.pageSize = event.rows;
    this.cargarPromotoras(); // Recargar datos desde el backend
  }



}
