import { Component } from '@angular/core';
import {DemoServicio} from './demo/DemoServicio';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ShowSync-Frontend';

  mensaje: string = '';

  constructor(private DemoServicio: DemoServicio ) {
  }

  ngOnInit(): void {
    this.DemoServicio.getMensaje().subscribe(
      (response) => this.mensaje = response,
      (error) => console.error('Error:', error)
    );
  }
}
