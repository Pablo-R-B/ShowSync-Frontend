import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { SalasService } from '../../../servicios/salas.service';

@Component({
  selector: 'app-panel-salas',
  templateUrl: './panel-salas.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf
  ]
})
export class PanelSalasComponent implements OnInit {
  salas: any[] = [];
  salasFiltradas: any[] = [];
  filtro: string = '';

  constructor(
    private salaService: SalasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerSalas();
  }

  obtenerSalas(): void {
    this.salaService.obtenerTodas().subscribe({
      next: (data) => {
        this.salas = data;
        this.salasFiltradas = data;
      },
      error: (err) => {
        console.error('Error al obtener salas:', err);
      }
    });
  }

  filtrarSalas(): void {
    const texto = this.filtro.toLowerCase();
    this.salasFiltradas = this.salas.filter(sala =>
      sala.nombre.toLowerCase().includes(texto)
    );
  }

  crearSala(): void {
    this.router.navigate(['/admin/salas/nueva']);
  }

  editarSala(id: number): void {
    this.router.navigate([`/admin/salas/editar/${id}`]);
  }

  eliminarSala(id: number): void {
    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        iconColor: '#BF0D22', // Cambia el color del ícono aquí
        confirmButtonText: 'Sí, eliminar',
        confirmButtonColor: '#BF0D22', // Cambia el color del botón aquí
        cancelButtonText: 'Cancelar'
      }).then(result => {
        if (result.isConfirmed) {
          this.salaService.eliminar(id).subscribe({
            next: () => this.obtenerSalas(),
            error: (err) => console.error('Error al eliminar sala:', err)
          });
        }
      });
    });
  }
  verPerfilSala(id: number): void {
    this.router.navigate([`/salas/${id}`]);
  }

}
