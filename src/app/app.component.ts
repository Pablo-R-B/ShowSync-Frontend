import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // <-- aquí falta la "s"
})
export class AppComponent {
  title = 'ShowSync-Frontend';
  mensaje: string = '';
}
