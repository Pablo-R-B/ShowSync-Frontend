import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  standalone: true,
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  @Input() texto ='';


}
