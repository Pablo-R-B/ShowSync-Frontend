import { Component } from '@angular/core';
import {DemoServicio} from './demo/DemoServicio';
import {RouterOutlet} from '@angular/router';
import {BarraNavegacionComponent} from '../componentes/barra-navegacion/barra-navegacion.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    BarraNavegacionComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ShowSync-Frontend';

  mensaje: string = '';

  constructor(private DemoServicio: DemoServicio ) {
  }

  // ngOnInit(): void {
  //   this.DemoServicio.getMensaje().subscribe(
  //     (response) => this.mensaje = response,
  //     (error) => console.error('Error:', error)
  //   );
  // }
}
