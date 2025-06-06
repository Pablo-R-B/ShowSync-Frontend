import { Routes } from '@angular/router';
import {LandingPageComponent} from './pages/landing-page/landing-page.component';
import {RegistroComponent} from './pages/registro/registro.component';
import {LoginComponent} from './pages/login/login.component';
import {RecuperarComponent} from './pages/login/recuperar/recuperar.component';
import {RestablecerComponent} from './pages/login/restablecer/restablecer.component';
import {PerfilSalaComponent} from './pages/perfil-sala/perfil-sala.component';
import {FormularioSalaComponent} from './pages/admin/formulario-sala/formulario-sala.component';
import {CatalogoArtistasComponent} from './pages/catalogo-artistas/catalogo-artistas.component';
import {EventosComponent} from './pages/eventos/eventos.component';
import {BusquedaEventosComponent} from './pages/busqueda-eventos/busqueda-eventos.component';
import {PerfilPromotoresComponent} from './pages/perfil-promotores/perfil-promotores.component';
import {PromotoresComponent} from './pages/promotores/promotores.component';
import {BusquedaPromotoresComponent} from './pages/busqueda-promotores/busqueda-promotores.component';
import {EditarEventosComponent} from './pages/editar-eventos/editar-eventos.component';
import {PerfilArtistaComponent} from './pages/perfil-artista/perfil-artista.component';
import {CatalogoSalaComponent} from './pages/catalogo-sala/catalogo-sala.component';
import {AdminPanelComponent} from './pages/admin/admin-panel/admin-panel.component';
import {ConfirmarEventosComponent} from './pages/confirmar-eventos/confirmar-eventos.component';
import {PerfilCompletoGuard} from './guards/PerfilCompletoGuard';
import {RegistroPromotorComponent} from './pages/registro-promotor/registro-promotor.component';
import {RegistroArtistaComponent} from './pages/registro-artista/registro-artista.component';
import {PerfilAdminArtistaComponent} from './pages/perfil-admin-artista/perfil-admin-artista.component';

export const routes: Routes = [
  // Rutas de autenticación
  { path: 'auth/registro', component: RegistroComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/recuperar', component: RecuperarComponent },
  { path: 'auth/restablecer', component: RestablecerComponent },
  { path: 'datos-promotor', component: RegistroPromotorComponent },
  { path:'datos-artista', component:RegistroArtistaComponent},
  { path: 'landing-page', component: LandingPageComponent },



  // Rutas de eventos
  { path: 'eventos', component: EventosComponent },

  {
    path: '',
    canActivateChild: [PerfilCompletoGuard],
    children: [
      // Rutas de promotores
      { path: 'promotores', component: PromotoresComponent },
      { path: 'promotores/:id', component: PromotoresComponent },
      { path: 'promotor/:id', component: PromotoresComponent },
      { path: 'busqueda-promotores', component: BusquedaPromotoresComponent },
      { path: 'perfil-promotores', component: PerfilPromotoresComponent },

      // Rutas de eventos
      { path: 'eventos/:id', component: EventosComponent },
      { path: 'busqueda-eventos', component: BusquedaEventosComponent },
      { path: 'editar-eventos', component: EditarEventosComponent },
      { path: 'promotores/:idPromotor/eventos/:idEvento/editar', component: EditarEventosComponent },
      { path: 'promotores/:idPromotor/eventos/:idEvento/confirmar', component: ConfirmarEventosComponent },

      // Rutas de salas (públicas)
      { path: 'catalogo-salas', component: CatalogoSalaComponent, pathMatch: 'full' },
      { path: 'salas/:id', component: PerfilSalaComponent },

      // Rutas de artistas
      { path: 'catalogo-artistas', component: CatalogoArtistasComponent, pathMatch: 'full' },
      { path: 'artista/:id', component: PerfilArtistaComponent, pathMatch: 'full' },
      {path: 'admin-artista', component: PerfilAdminArtistaComponent},
    ],
  },

  //Ruta de instrucciones
   {path: 'instrucciones', loadComponent: () => import('./pages/intrucciones-uso/intrucciones-uso.component').then(m => m.InstruccionesUsoComponent)},



  // ✅ PANEL DE ADMINISTRACIÓN - Configuración correcta
  {
    path: 'admin',
    component: AdminPanelComponent,
    children: [
      {
        path: 'salas',
        loadComponent: () => import('./pages/admin/panel-salas/panel-salas.component').then(m => m.PanelSalasComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/admin/panel-usuarios/panel-usuarios.component').then(m => m.PanelUsuariosComponent),
      },
      {
        path: 'eventos',
        loadComponent: () => import('./pages/admin/panel-eventos/panel-eventos.component').then(m => m.PanelEventosComponent),
      },

      {
        path:'resumen',
        loadComponent: () => import('./pages/admin/resumen/resumen.component').then(m => m.ResumenComponent),
      },
      {
        path: 'generos',
        loadComponent: () => import('./pages/admin/panel-generos/panel-generos.component').then(m => m.PanelGenerosComponent),
      },
      // Rutas específicas de formularios de salas (como rutas hijas)
      {
        path: 'salas/nueva',
        component: FormularioSalaComponent
      },
      {
        path: 'salas/editar/:id',
        component: FormularioSalaComponent
      },
      {
        path: '',
        redirectTo: 'resumen',
        pathMatch: 'full',
      }
    ]
  }
];
