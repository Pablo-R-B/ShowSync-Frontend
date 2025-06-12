import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router'; // <-- Importa RouterOutlet aquí
import { filter } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { NgIf, registerLocaleData } from '@angular/common';
import { HeaderComponent } from './componentes/header/header.component';
import { FooterComponent } from './componentes/footer/footer.component';
import { SharedModule } from 'primeng/api';
import localeEs from '@angular/common/locales/es';
import { ReproductorComponent } from './componentes/reproductor/reproductor.component';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ButtonModule,
    NgIf,
    HeaderComponent,
    FooterComponent,
    SharedModule,
    ReproductorComponent,
    RouterOutlet  // <-- Agrega aquí RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ShowSync-Frontend';
  mostrarHeader = true;
  showFooter = true;
  mostrarReproductor = true;

  private readonly hiddenRoutes = [
    '/auth/login',
    '/auth/registro',
    '/auth/restablecer',
    '/auth/recuperar',
    '/auth/restablecer'
  ];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const ocultar = this.hiddenRoutes.some(route => event.urlAfterRedirects.startsWith(route));
      this.mostrarHeader = !ocultar;
      this.showFooter = !ocultar;
      this.mostrarReproductor = !ocultar;
    });
  }
}
