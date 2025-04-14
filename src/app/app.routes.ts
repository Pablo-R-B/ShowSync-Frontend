import { Routes } from '@angular/router';
import {RegistroComponent} from './paginas/registro/registro.component';
import {LoginComponent} from './paginas/login/login.component';


export const routes: Routes = [
  { path: 'auth/registro', component: RegistroComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: '', redirectTo: 'auth/registro', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/registro' }
];
