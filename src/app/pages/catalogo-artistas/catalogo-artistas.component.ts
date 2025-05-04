import {Component, OnInit} from '@angular/core';
import {Paginator} from 'primeng/paginator';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {RespuestaPaginada} from '../../interfaces/respuesta-paginada';
import {HeroComponent} from '../../componentes/hero/hero.component';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-catalogo-artistas',
  imports: [
    Paginator,
    NgForOf,
    NgIf,
    FormsModule,
    HeroComponent,
    NgOptimizedImage,
    RouterLink
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
  paginaActual: number = 0;
  private todosLosArtistas: Artistas[] = [];
  private artistasPorGeneroCache: { [genero: string]: Artistas[] } = {};

  constructor(private artistasService: ArtistasService, private generosMusicalesService: GenerosMusicalesService,
              private router: Router) {
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
    if (this.pageSize !== event.rows) {
      this.paginaActual = 0;
    }
    this.listarArtistas(); // Vuelve a cargar los datos con los nuevos parámetros
  }

  async verDetallesArtista(idArtista: number) {
    try {
      if (idArtista) {
        console.log("Ruta actual antes de navegar:", this.router.url);
        await this.router.navigate(['/artista', idArtista]); // [[8]]
      } else {
        throw new Error("ID no válido");
      }
    } catch (error) {
      console.error("Error en navegación:", error);
    }
  }


}
