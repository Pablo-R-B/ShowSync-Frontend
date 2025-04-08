import { Component } from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [ButtonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ShowSync-Frontend';
}
