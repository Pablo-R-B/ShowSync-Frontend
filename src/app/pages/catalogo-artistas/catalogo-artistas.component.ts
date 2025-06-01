import {Component, OnInit} from '@angular/core';
import {Paginator, PaginatorState} from 'primeng/paginator';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {RespuestaPaginada} from '../../interfaces/respuesta-paginada';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-catalogo-artistas',
  imports: [
    Paginator,
    NgForOf,
    NgIf,
    FormsModule,
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
    // Limpiar error anterior al iniciar nueva búsqueda
    this.errorMsj = '';

    if (this.generoSeleccionado && this.generoSeleccionado.trim() !== "") {
      this.artistasService.artistasPorGenero(this.generoSeleccionado, this.paginaActual, this.pageSize, this.busqueda).subscribe({
        next: (resultado: RespuestaPaginada<Artistas>) => {
          this.artistasLista = resultado.items;
          this.totalItems = resultado.totalItems;

          // Mensaje informativo si no hay resultados, pero no es un error
          if (resultado.items.length === 0) {
            console.log("No se encontraron artistas para el género seleccionado");
          }

          console.log("Artistas filtrados por género y búsqueda:", this.artistasLista);
        },
        error: (err) => {
          this.errorMsj = "Error al filtrar artistas: " + err.message;
          this.artistasLista = []; // Limpiar lista en caso de error
          console.error("Error en listarArtistas:", err);
        }
      });
    } else {
      this.artistasService.listarArtistasConGeneros(this.paginaActual, this.pageSize, this.busqueda).subscribe({
        next: (results: RespuestaPaginada<Artistas>) => {
          this.artistasLista = results.items;
          this.totalItems = results.totalItems;
        },
        error: (error) => {
          this.errorMsj = "Error al cargar artistas: " + error.message;
          this.artistasLista = []; // Limpiar lista en caso de error
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
    this.errorMsj = ''; // Limpiar mensaje de error anterior
    this.paginaActual = 0; // Resetear a primera página
    console.log('Género seleccionado:', this.generoSeleccionado);
    this.listarArtistas();
  }

  onBuscarPorNombre(busqueda: string) {
    this.busqueda = busqueda;
    this.errorMsj = ''; // Limpiar mensaje de error anterior
    this.paginaActual = 0; // Resetear a primera página
    console.log('Buscado:', this.busqueda);
    this.buscar();
  }

  limpiarBusqueda():  void {
    this.busqueda = '';
    this.generoSeleccionado = '';
    this.errorMsj = '';
    this.paginaActual = 0;


    // Cargar todos los artistas sin filtros
    this.listarArtistas();
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


  onPageChange($event: PaginatorState) {

  }




}
