import {Component} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';
import {ButtonModule} from 'primeng/button';
import {NgIf, registerLocaleData} from '@angular/common';
import {HeaderComponent} from './componentes/header/header.component';
import {FooterComponent} from './componentes/footer/footer.component';
import {SharedModule} from 'primeng/api';
import localeEs from '@angular/common/locales/es';
registerLocaleData(localeEs, 'es');

// @ts-ignore
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ButtonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    SharedModule, // Importa el módulo compartido
    NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ShowSync-Frontend';
  mostrarHeader = true;
  showFooter = true;

  // Rutas en las que se ocultan header y footer
  private readonly hiddenRoutes = [

    '/auth/login',
    '/auth/registro',
    '/auth/restablecer',
    '/auth/recuperar'
  ];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const ocultar = this.hiddenRoutes.includes(event.urlAfterRedirects);
      this.mostrarHeader = !ocultar;
      this.showFooter = !ocultar;
    });
  }
}
