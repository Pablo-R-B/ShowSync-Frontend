import { Routes } from '@angular/router';
import {CatalogoArtistasComponent} from '../componentes/catalogo-artistas/catalogo-artistas.component';

export const routes: Routes = [
  {path:'catalogo-artistas', component:CatalogoArtistasComponent, pathMatch:'full'},
];
