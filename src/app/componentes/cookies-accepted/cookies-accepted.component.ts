import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule], // Asegúrate de incluir CommonModule aquí
  templateUrl: './cookies-accepted.component.html',
  styleUrls: ['./cookies-accepted.component.css']
})
export class CookiesAcceptedComponent {
  showBanner: boolean = true;

  acceptCookies(): void {
    localStorage.setItem('cookiesAccepted', 'true');
    this.showBanner = false;
  }

  ngOnInit(): void {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted === 'true') {
      this.showBanner = false;
    }
  }
}
