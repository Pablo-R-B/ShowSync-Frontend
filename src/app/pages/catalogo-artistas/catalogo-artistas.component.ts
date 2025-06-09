import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {RespuestaPaginada} from '../../interfaces/respuesta-paginada';
import {Router, RouterLink} from '@angular/router';
import {GeneroMusical} from '../../interfaces/GeneroMusical';

@Component({
  selector: 'app-catalogo-artistas',
  imports: [
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
  paginaActual: number = 0;

  paginaNavegacion: number = 1;
  totalPaginas: number = 0;
  isLoading: boolean = false;

  constructor(private artistasService: ArtistasService, private generosMusicalesService: GenerosMusicalesService,
              private router: Router) {
  }

  ngOnInit() {
    this.listarArtistas();
    this.cargarGeneros();
  }

  listarArtistas(): void {
    // ✅ Activar loading al inicio
    this.isLoading = true;
    this.errorMsj = '';

    if (this.generoSeleccionado && this.generoSeleccionado.trim() !== "") {
      this.artistasService.artistasPorGenero(this.generoSeleccionado, this.paginaActual, this.pageSize, this.busqueda).subscribe({
        next: (resultado: RespuestaPaginada<Artistas>) => {
          this.artistasLista = resultado.items;
          this.totalItems = resultado.totalItems;

          // ✅ CALCULAR totalPaginas
          this.totalPaginas = Math.ceil(this.totalItems / this.pageSize);

          // ✅ Desactivar loading
          this.isLoading = false;

          if (resultado.items.length === 0) {
            console.log("No se encontraron artistas para el género seleccionado");
          }

          console.log("Artistas filtrados por género y búsqueda:", this.artistasLista);
        },
        error: (err) => {
          this.errorMsj = "Error al filtrar artistas: " + err.message;
          this.artistasLista = [];
          this.totalItems = 0;
          this.totalPaginas = 0;
          // ✅ Desactivar loading en caso de error
          this.isLoading = false;
          console.error("Error en listarArtistas:", err);
        }
      });
    } else {
      this.artistasService.listarArtistasConGeneros(this.paginaActual, this.pageSize, this.busqueda).subscribe({
        next: (results: RespuestaPaginada<Artistas>) => {
          this.artistasLista = results.items;
          this.totalItems = results.totalItems;

          // ✅ CALCULAR totalPaginas
          this.totalPaginas = Math.ceil(this.totalItems / this.pageSize);

          // ✅ Desactivar loading
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMsj = "Error al cargar artistas: " + error.message;
          this.artistasLista = [];
          this.totalItems = 0;
          this.totalPaginas = 0;
          // ✅ Desactivar loading en caso de error
          this.isLoading = false;
        }
      });
    }
  }

  buscar():void{
    this.listarArtistas();
  }

  cargarGeneros() {
    this.generosMusicalesService.listarGeneros().subscribe({
      next: (data: GeneroMusical[]) => {
        this.generos =data.map(gen => gen.nombre);
        console.log('Géneros cargados:', data); // ✅ Cambié console.error por console.log
      },
      error: (err: any) => console.error('Error al cargar géneros:', err)
    });
  }

  onGeneroSeleccionado(genero: string) {
    this.generoSeleccionado = genero;
    this.errorMsj = '';
    this.paginaActual = 0;
    this.paginaNavegacion = 1; // ✅ Resetear navegación rápida
    console.log('Género seleccionado:', this.generoSeleccionado);
    this.listarArtistas();
  }

  onBuscarPorNombre(busqueda: string) {
    this.busqueda = busqueda;
    this.errorMsj = '';
    this.paginaActual = 0;
    this.paginaNavegacion = 1; // ✅ Resetear navegación rápida
    console.log('Buscado:', this.busqueda);
    this.buscar();
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.generoSeleccionado = '';
    this.errorMsj = '';
    this.paginaActual = 0;
    this.paginaNavegacion = 1; // ✅ Resetear navegación rápida

    this.listarArtistas();
  }

  async verDetallesArtista(idArtista: number) {
    try {
      if (idArtista) {
        console.log("Ruta actual antes de navegar:", this.router.url);
        await this.router.navigate(['/artista', idArtista]);
      } else {
        throw new Error("ID no válido");
      }
    } catch (error) {
      console.error("Error en navegación:", error);
    }
  }



  protected readonly window = window;

  abrirEnlace(url: string): void {
    window.open(url, '_blank');
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas || this.isLoading) return;
    this.paginaActual = pagina;
    this.paginaNavegacion = pagina + 1; // ✅ Actualizar navegación rápida
    this.listarArtistas();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  paginaSiguiente(): void {
    if (!this.esUltimaPagina && !this.isLoading) {
      this.cambiarPagina(this.paginaActual + 1);
    }
  }

  paginaAnterior(): void {
    if (!this.esPrimeraPagina && !this.isLoading) {
      this.cambiarPagina(this.paginaActual - 1);
    }
  }

  irAPagina(): void {
    const pagina = Number(this.paginaNavegacion);
    if (!isNaN(pagina) && pagina >= 1 && pagina <= this.totalPaginas) {
      const paginaIndex = pagina - 1;
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

  cambiarItemsPorPagina(): void {
    this.paginaActual = 0;
    this.paginaNavegacion = 1;
    this.listarArtistas();
  }
}
