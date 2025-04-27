import { Routes } from '@angular/router';
import {RegistroComponent} from './pages/registro/registro.component';
import {LoginComponent} from './pages/login/login.component';
import {RecuperarComponent} from './pages/login/recuperar/recuperar.component';
import {RestablecerComponent} from './pages/login/restablecer/restablecer.component';
import {PerfilSalaComponent} from './pages/perfil-sala/perfil-sala.component';
import {FormularioSalaComponent} from './pages/admin/formulario-sala/formulario-sala.component';
import {CatalogoArtistasComponent} from './pages/catalogo-artistas/catalogo-artistas.component';


export const routes: Routes = [
  { path: 'auth/registro', component: RegistroComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/recuperar', component: RecuperarComponent },
  { path: 'auth/restablecer', component: RestablecerComponent },
  { path: 'salas/:id', component: PerfilSalaComponent },

  // Rutas del panel de administración
  {
    path: 'admin/salas',
    loadComponent: () => import('./pages/admin/panel-salas/panel-salas.component').then(m => m.PanelSalasComponent)
  },
  { path: 'admin/salas/nueva', component: FormularioSalaComponent },
  { path: 'admin/salas/editar/:id', component: FormularioSalaComponent },

  // Redirecciones
  { path: '', redirectTo: 'auth/registro', pathMatch: 'full' },
  // { path: '**', redirectTo: 'auth/registro' },
  {path: 'catalogo-artistas', component:CatalogoArtistasComponent, pathMatch: 'full'}
];
