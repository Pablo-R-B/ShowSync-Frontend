import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './componentes/header/header.component';
import { FooterComponent } from './componentes/footer/footer.component';
import { filter } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import {FullCalendarModule} from '@fullcalendar/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    NgIf,
    FullCalendarModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
