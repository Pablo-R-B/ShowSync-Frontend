import {Component, OnInit} from '@angular/core';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {ActivatedRoute, Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-perfil-artista-prueba',
  imports: [
    NgIf
  ],
  templateUrl: './perfil-artista-prueba.component.html',
  styleUrl: './perfil-artista-prueba.component.css'
})
export class PerfilArtistaPruebaComponent implements OnInit{
  artista:Artistas | undefined;

  constructor(private artistasService:ArtistasService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.artistasService.artistaPorId(+id).subscribe(
          data => { this.artista = data; },
          err  => console.error('Error HTTP:', err)
        );
      } else {
        console.error('ID no encontrado en la URL');
      }
    });
  }



}
