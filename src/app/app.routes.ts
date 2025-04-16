import { Routes } from '@angular/router';
import {LandingPageComponent} from './page/landing-page/landing-page.component';
import {RegistroComponent} from './pages/registro/registro.component';
import {LoginComponent} from './pages/login/login.component';
import {RecuperarComponent} from './pages/login/recuperar/recuperar.component';
import {RestablecerComponent} from './pages/login/restablecer/restablecer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'landing-page', pathMatch: 'full' },
  { path: 'landing-page', component: LandingPageComponent },
];

export const routes: Routes = [
  { path: 'auth/registro', component: RegistroComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/recuperar', component: RecuperarComponent },
  { path: 'auth/restablecer', component: RestablecerComponent },
  { path: '', redirectTo: 'auth/registro', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/registro' }
];
