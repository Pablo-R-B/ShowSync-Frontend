import { Component } from '@angular/core';

@Component({
  selector: 'app-condiciones',
  imports: [],
  templateUrl: './condiciones.component.html',
  styleUrl: './condiciones.component.css'
})
export class CondicionesComponent {

  // Método para mostrar/ocultar el botón de scroll to top
  private setupScrollButton(): void {
    const scrollButton = document.querySelector('.scroll-top') as HTMLElement;
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
      } else {
        scrollButton.classList.remove('visible');
      }
    });
  }

// Método para scroll suave hacia arriba
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

// Método para scroll suave en navegación interna
  private setupSmoothScroll(): void {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector((anchor as HTMLAnchorElement).getAttribute('href')!) as HTMLElement;
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

// Llamar a los métodos en ngOnInit
  ngOnInit(): void {
    this.setupScrollButton();
    this.setupSmoothScroll();
  }

}
