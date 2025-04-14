import { Routes } from '@angular/router';
import {RegistroComponent} from './paginas/registro/registro.component';


export const routes: Routes = [
  { path: 'auth/registro', component: RegistroComponent },
  { path: '', redirectTo: 'auth/registro', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/registro' }
];
