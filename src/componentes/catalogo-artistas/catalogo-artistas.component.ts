import {Component, OnInit} from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HeroComponent} from "../hero/hero.component";
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {Paginator} from 'primeng/paginator';
import {RespuestaPaginada} from '../../interfaces/respuesta-paginada';



@Component({
  selector: 'app-catalogo-artistas',
  imports: [
    FormsModule,
    HeroComponent,
    NgIf,
    NgForOf,
    Paginator,
  ],
  templateUrl: './catalogo-artistas.component.html',
  standalone: true,
  styleUrl: './catalogo-artistas.component.css'
})
export class CatalogoArtistasComponent implements OnInit {

  artistasLista: Artistas[] = [];
  generos: string[] = [];
  generoSeleccionado: string = '';
  errorMsj:string ='';
  busqueda:string ='';
  pageSize: number = 6;
  totalItems: number = 0;
  paginas: number[] = [];
  paginaActual: number = 1;
  private todosLosArtistas: Artistas[] = [];
  private artistasPorGeneroCache: { [genero: string]: Artistas[] } = {};

  constructor(private artistasService: ArtistasService, private generosMusicalesService: GenerosMusicalesService) {
  }

  ngOnInit() {
    this.listarArtistas();
    this.cargarGeneros();
  }


  listarArtistas(): void {
    if (this.generoSeleccionado && this.generoSeleccionado.trim() !== "") {
      this.artistasService.artistasPorGenero(this.generoSeleccionado, this.paginaActual, this.pageSize, this.busqueda).subscribe({
        next: (resultado: RespuestaPaginada<Artistas>) => {
          this.artistasLista = resultado.items;
          this.totalItems = resultado.totalItems;
          console.log("Artistas filtrados por género y búsqueda:", this.artistasLista); // Cambia a console.log
        },
        error: (err) => {
          this.errorMsj = "Error al filtrar artistas: " + err.message;
          console.error("Error en listarArtistas:", err);
        }
      });
    } else {
      this.artistasService.listarArtistasConGeneros(this.paginaActual, this.pageSize, this.busqueda).subscribe({
        next: (results:RespuestaPaginada<Artistas>) => {
          this.artistasLista = results.items;
          this.totalItems = results.totalItems;
        },
        error: (error) => {
          this.errorMsj = error.message;
        }
      });
    }
  }


  buscar():void{
    this.listarArtistas();
  }

  cargarGeneros() {
    this.generosMusicalesService.listarGeneros().subscribe({
      next: (data: string[]) => {
        this.generos = data
        console.error('Datos recibidos:', data);
      },
      error: (err: any) => console.error('Error al cargar géneros:', err)
    });
  }

  onGeneroSeleccionado(genero: string) {
    this.generoSeleccionado = genero;
    console.log('Género seleccionado:', this.generoSeleccionado);
    this.listarArtistas();
  }

  onBuscarPorNombre(busqueda: string) {
    this.busqueda = busqueda;
    console.log('Buscado:', this.busqueda);
    this.buscar();
  }

  limpiarBusqueda(): void {
    this.busqueda = ''; // Limpia la búsqueda
    this.artistasLista = [];
    this.listarArtistas();// Limpia la lista de artistas
  }

  onPageChange(event: any): void {
    this.paginaActual = event.page; // Índice de la página (empezando en 0)
    this.pageSize = event.rows; // Tamaño de página seleccionado (6, 10 o 15)
    this.listarArtistas(); // Vuelve a cargar los datos con los nuevos parámetros
  }


}
