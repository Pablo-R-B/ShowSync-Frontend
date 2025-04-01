import {Component, OnInit} from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {NgForOf, NgIf} from '@angular/common';
import {GenerosMusicales} from '../../interfaces/generos-musicales';
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {FormsModule} from '@angular/forms';



@Component({
  selector: 'app-catalogo-artistas',
  imports: [
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './catalogo-artistas.component.html',
  standalone: true,
  styleUrl: './catalogo-artistas.component.css'
})
export class CatalogoArtistasComponent implements OnInit {

  artistasLista: Artistas[] = [];
  generos: GenerosMusicales[] = [];
  generoSeleccionado: string = '';
  errorMsj:string ='';

  constructor(private artistasService: ArtistasService, private generosMusicalesService: GenerosMusicalesService) {
  }

  ngOnInit() {
    this.listarArtistas();
    this.cargarGeneros();
  }

  listarArtistas():void {
    if(this.generoSeleccionado){
      this.artistasService.artistasPorGenero(this.generoSeleccionado).subscribe({
        next: resultado => {
          this.artistasLista = resultado;
          console.error("Error en listarArtistas",resultado);
        },
        error: (err) => {
          this.errorMsj = "Error al filtrar artistas: " + err.message;
          console.error("Error en listarArtistas:", err);
        }
        });

    }else{
      this.artistasService.listarArtistasConGeneros().subscribe({
        next: results => {
          console.error('Datos recibidos:', results);
          this.artistasLista = results;
        }, error: (error) => {
          this.errorMsj = error.message;
        }
      })
    }
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
    // this.generoSeleccionado = genero;
    const generoFiltrado = this.generoSeleccionado.trim().toUpperCase();
    this.listarArtistas();
  }

}
