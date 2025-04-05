import {Component, OnInit} from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {NgForOf, NgIf} from '@angular/common';
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {FormsModule} from '@angular/forms';
import {HeroComponent} from "../hero/hero.component";



@Component({
  selector: 'app-catalogo-artistas',
  imports: [
    FormsModule,
    HeroComponent,
    NgIf,
    NgForOf,
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
      this.artistasService.artistasPorGenero(this.generoSeleccionado).subscribe({
        next: resultado => {
          this.artistasLista = this.busqueda
          ? resultado.filter(artista => artista.nombre.toLowerCase()
              .includes(this.busqueda.toLowerCase()))
            : resultado;
          console.log("Artistas filtrados por género y búsqueda:", this.artistasLista); // Cambia a console.log
        },
        error: (err) => {
          this.errorMsj = "Error al filtrar artistas: " + err.message;
          console.error("Error en listarArtistas:", err);
        }
      });
    } else {
      this.artistasService.listarArtistasConGeneros().subscribe({
        next: results => {
          this.artistasLista = this.busqueda
            ? results.filter((artista: { nombre: string; }) => artista.nombre.toLowerCase().
            includes(this.busqueda.toLowerCase()))
            : results;
          console.log('Datos recibidos y filtrados por búsqueda:', this.artistasLista);
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
      next: data => {
        this.generos = data
        console.error('Datos recibidos:', data);
      },
      error: (err) => console.error('Error al cargar géneros:', err)
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


}
