import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sala } from '../../interfaces/sala';
import { SalasService } from '../../servicios/salas.service';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { FiltrosSala } from '../../interfaces/filtrosSala';


@Component({
  selector: 'app-catalogo-sala',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-sala.component.html',
  styleUrl: './catalogo-sala.component.css'
})
export class CatalogoSalaComponent implements OnInit {
  salas: Sala[] = [];
  salasFiltradas: Sala[] = [];
  cargando: boolean = false;

  // Objeto unificado para todos los filtros
  filtros: FiltrosSala = {
    texto: '',
    ciudad: '',
    provincia: '',
    capacidadMin: 0
  };

  // Para gestionar búsquedas con debounce
  private filtrosSubject = new Subject<void>();

  constructor(private salasService: SalasService) {}

  ngOnInit(): void {
    this.cargarSalas();

    // Configurar el debounce para filtros automáticos
    this.filtrosSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.ejecutarFiltrado());
  }

  cargarSalas(): void {
    this.cargando = true;
    this.salasService.obtenerTodas().subscribe({
      next: (salas) => {
        this.salas = salas;
        this.ejecutarFiltrado();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar las salas', err);
        this.cargando = false;
      }
    });
  }

  /**
   * Aplica todos los filtros actuales a las salas
   */
  aplicarFiltros(): void {
    this.ejecutarFiltrado();
  }

  /**
   * Ejecuta la lógica de filtrado en base a los criterios almacenados
   */
  private ejecutarFiltrado(): void {
    // Normalizar los criterios de búsqueda
    const texto = this.filtros.texto.toLowerCase().trim();
    const ciudad = this.filtros.ciudad.toLowerCase().trim();
    const provincia = this.filtros.provincia.toLowerCase().trim();
    const capacidadMin = this.filtros.capacidadMin;

    // Aplicar todos los filtros en una sola operación
    this.salasFiltradas = this.salas.filter(sala => {
      const cumpleTexto = !texto ||
        sala.nombre?.toLowerCase().includes(texto) ||
        sala.descripcion?.toLowerCase().includes(texto);

      const cumpleCiudad = !ciudad ||
        sala.ciudad?.toLowerCase().includes(ciudad);

      const cumpleProvincia = !provincia ||
        sala.provincia?.toLowerCase().includes(provincia);

      const cumpleCapacidad = sala.capacidad >= capacidadMin;

      return cumpleTexto && cumpleCiudad && cumpleProvincia && cumpleCapacidad;
    });
  }

  /**
   * Verifica si hay algún filtro activo
   */
  hayFiltrosActivos(): boolean {
    return this.filtros.ciudad !== '' ||
      this.filtros.provincia !== '' ||
      this.filtros.capacidadMin > 0;
  }

  /**
   * Actualiza los resultados cuando se escribe en el cuadro de búsqueda
   */
  actualizarBusquedaTexto(): void {
    this.filtrosSubject.next();
  }

  /**
   * Limpia un filtro específico
   */
  limpiarFiltro(filtro: keyof FiltrosSala): void {
    if (filtro === 'capacidadMin') {
      this.filtros[filtro] = 0;
    } else {
      this.filtros[filtro] = '';
    }
    this.ejecutarFiltrado();
  }

  /**
   * Limpia todos los filtros
   */
  limpiarTodosFiltros(): void {
    this.filtros = {
      texto: '',
      ciudad: '',
      provincia: '',
      capacidadMin: 0
    };
    this.ejecutarFiltrado();
  }
}
