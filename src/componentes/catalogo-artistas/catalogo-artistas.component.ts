import { Component } from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {NgForOf, NgIf} from '@angular/common';



@Component({
  selector: 'app-catalogo-artistas',
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './catalogo-artistas.component.html',
  styleUrl: './catalogo-artistas.component.css'
})
export class CatalogoArtistasComponent {

  artistasLista: Artistas[] = [];
  errorMsj:string ='';

  constructor(private artistasService: ArtistasService) {
  }

  ngOnInit() {
    this.listarArtistas();

  }

  listarArtistas():void {
    this.artistasService.listarArtistasConGeneros().subscribe({
      next: results => {
        console.error('Datos recibidos:', results);
        this.artistasLista = results;
      }, error: error => {
        this.errorMsj = error.message;
      }
    })
  }
}
