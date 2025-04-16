import {Component} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {filter} from 'rxjs';
import {ButtonModule} from 'primeng/button';
import {HeaderComponent} from './componentes/header/header.component';
import {FooterComponent} from './componentes/footer/footer.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  mostrarHeader = true;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const rutasSinHeader = ['/auth/login', '/auth/registro', 'auth/restablecer', '/auth/recuperar'];
      this.mostrarHeader = !rutasSinHeader.includes(event.urlAfterRedirects);
    });
  }
}
