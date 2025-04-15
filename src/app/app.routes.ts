import { Routes } from '@angular/router';
import {RegistroComponent} from './pages/registro/registro.component';
import {LoginComponent} from './pages/login/login.component';


export const routes: Routes = [
  { path: 'auth/registro', component: RegistroComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: '', redirectTo: 'auth/registro', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/registro' }
];
