import {Component, NgIterable, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {PromotoresService} from '../../servicios/PromotoresService';
import {Promotor} from '../../interfaces/Promotor';
import {RouterLink} from '@angular/router';




@Component({
  selector: 'app-busqueda-promotores',
  imports: [
    FormsModule,
    NgForOf,
    RouterLink
  ],
  templateUrl: './busqueda-promotores.component.html',
  styleUrl: './busqueda-promotores.component.css'
})
export class BusquedaPromotoresComponent implements OnInit {
  promotoras: Promotor[] = []; // Cambié 'promotor' por 'promotoras'
  promotorSeleccionado: Promotor | null = null;
  nombrePromotoraSeleccionada: string = '';
  promotorasFiltradas: Promotor[] = [];

  constructor(private promotoresService: PromotoresService) {}

  ngOnInit(): void {
    this.cargarPromotoras();
  }

  cargarPromotoras(): void {
    this.promotoresService.obtenerPromotoras().subscribe(data => {
      this.promotoras = data;
      this.promotorasFiltradas = data;
    });
  }

  aplicarFiltros(): void {
    const filtro = this.nombrePromotoraSeleccionada.toLowerCase();
    this.promotorasFiltradas = this.promotoras.filter(p =>
      p.nombrePromotor.toLowerCase().includes(filtro)
    );
  }

  verInfoPromotora(id?: number): void {
    if (id) { // Comprobamos que 'id' no sea undefined
      this.promotoresService.cargarPromotorPorId(id).subscribe(data => {
        this.promotorSeleccionado = data;
      });
    }
  }

  crearPromotor(promotorNuevo: Promotor): void {
    this.promotoresService.crearPromotor(promotorNuevo).subscribe(data => {
      this.promotoras.push(data);
      this.promotorasFiltradas.push(data);
    });
  }

  editarPromotor(id: number, promotorEditado: Promotor): void {
    this.promotoresService.editarPromotor(id, promotorEditado).subscribe(data => {
      const index = this.promotoras.findIndex(p => p.id === id);
      if (index !== -1) {
        this.promotoras[index] = data;
        this.aplicarFiltros();  // Para actualizar la lista filtrada
      }
    });
  }

  eliminarPromotor(id: number): void {
    this.promotoresService.eliminarPromotor(id).subscribe(() => {
      this.promotoras = this.promotoras.filter(p => p.id !== id);
      this.promotorasFiltradas = this.promotorasFiltradas.filter(p => p.id !== id);
    });
  }
}
