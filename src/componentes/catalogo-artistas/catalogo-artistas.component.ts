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
        NgIf,
        NgForOf,
        FormsModule,
        HeroComponent
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
          this.artistasLista = resultado;
          console.log("Artistas filtrados:", resultado); // Cambia a console.log
        },
        error: (err) => {
          this.errorMsj = "Error al filtrar artistas: " + err.message;
          console.error("Error en listarArtistas:", err);
        }
      });
    } else {
      this.artistasService.listarArtistasConGeneros().subscribe({
        next: results => {
          console.log('Datos recibidos:', results); // Cambia a console.log
          this.artistasLista = results;
        },
        error: (error) => {
          this.errorMsj = error.message;
        }
      });
    }
  }


  buscar():void{
    this.artistasService.buscarPorNombre(this.busqueda).subscribe({
      next: resultado => {
        this.artistasLista = resultado;
        console.log("Busqueda:", resultado);
      },
      error: (err) => {
        this.errorMsj = "Error al buscar: " + err.message;
      }
    })

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
