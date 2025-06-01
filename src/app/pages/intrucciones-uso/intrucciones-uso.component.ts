import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactoFormComponent } from './contacto-form/contacto-form.component';

interface NotaMusical {
  simbolo: string;
  top: string;
  left: string;
  opacity: number;
  delay: string;
  fontSize: string;
}

interface Particula {
  left: string;
  size: number;
  delay: string;
  duration: string;
}
@Component({
  selector: 'app-instrucciones-uso',
  standalone: true,
  imports: [
    CommonModule,
    ContactoFormComponent
  ],
  templateUrl: './intrucciones-uso.component.html',
  styleUrls: ['./intrucciones-uso.component.css']
})
export class InstruccionesUsoComponent  implements OnInit, OnDestroy {

  notasMusicales: NotaMusical[] = [];
  particulas: Particula[] = [];

  private intervalos: number[] = [];

  ngOnInit(): void {
    this.generarNotasMusicales();
    this.generarParticulas();
    this.iniciarGeneracionContinua();
  }

  ngOnDestroy(): void {
    // Limpiar intervalos al destruir el componente
    this.intervalos.forEach(intervalo => clearInterval(intervalo));
  }

  /**
   * Genera las notas musicales flotantes iniciales
   */
  generarNotasMusicales(): void {
    const simbolos = ['♪', '♫', '♬', '♩', '♯', '♭'];
    this.notasMusicales = [];

    for (let i = 0; i < 15; i++) {
      this.notasMusicales.push({
        simbolo: simbolos[Math.floor(Math.random() * simbolos.length)],
        top: Math.random() * 100 + '%',
        left: Math.random() * 100 + '%',
        opacity: Math.random() * 0.7 + 0.3,
        delay: Math.random() * 4 + 's',
        fontSize: (Math.random() * 0.5 + 1) + 'rem'
      });
    }
  }

  /**
   * Genera las partículas flotantes iniciales
   */
  generarParticulas(): void {
    this.particulas = [];

    for (let i = 0; i < 8; i++) {
      this.particulas.push({
        left: Math.random() * 100 + '%',
        size: Math.random() * 4 + 2,
        delay: Math.random() * 8 + 's',
        duration: (Math.random() * 4 + 6) + 's'
      });
    }
  }

  /**
   * Inicia la generación continua de partículas
   */
  private iniciarGeneracionContinua(): void {
    // Generar nuevas partículas cada 3 segundos
    const intervaloParticulas = setInterval(() => {
      if (this.particulas.length < 12) {
        const nuevaParticula: Particula = {
          left: Math.random() * 100 + '%',
          size: Math.random() * 4 + 2,
          delay: '0s',
          duration: (Math.random() * 4 + 6) + 's'
        };

        this.particulas.push(nuevaParticula);

        // Eliminar la partícula después de 10 segundos
        setTimeout(() => {
          const index = this.particulas.indexOf(nuevaParticula);
          if (index > -1) {
            this.particulas.splice(index, 1);
          }
        }, 10000);
      }
    }, 3000);

        this.intervalos.push(intervaloParticulas as unknown as number);
    }

  /**
   * Maneja el evento hover en las tarjetas
   */
  onCardHover(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    card.style.zIndex = '20';
  }

  /**
   * Maneja el evento al salir del hover en las tarjetas
   */
  onCardLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    setTimeout(() => {
      card.style.zIndex = 'auto';
    }, 300);
  }

  /**
   * Escucha el evento de scroll para efecto parallax
   */
  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    // Aplicar efecto parallax a las notas musicales
    const notes = document.querySelectorAll('.musical-note');
    notes.forEach((note: Element, index: number) => {
      const speed = (index % 3 + 1) * 0.3;
      const noteElement = note as HTMLElement;
      noteElement.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.05}deg)`;
    });
  }

  /**
   * Regenera las notas musicales (útil para efectos especiales)
   */
  regenerarNotas(): void {
    this.generarNotasMusicales();
  }

  /**
   * Añade una nueva partícula manualmente
   */
  añadirParticula(): void {
    if (this.particulas.length < 15) {
      const nuevaParticula: Particula = {
        left: Math.random() * 100 + '%',
        size: Math.random() * 6 + 3,
        delay: '0s',
        duration: (Math.random() * 3 + 4) + 's'
      };

      this.particulas.push(nuevaParticula);

      setTimeout(() => {
        const index = this.particulas.indexOf(nuevaParticula);
        if (index > -1) {
          this.particulas.splice(index, 1);
        }
      }, 8000);
    }
  }

  /**
   * Obtiene un color aleatorio para efectos especiales
   */
  private getRandomColor(): string {
    const colors = [
      'rgba(191, 13, 34, 0.4)',
      'rgba(204, 203, 203, 0.3)',
      'rgba(160, 164, 173, 0.4)',
      'rgba(119, 3, 22, 0.5)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Animación especial al hacer clic en el título
   */
  onTitleClick(): void {
    this.regenerarNotas();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.añadirParticula();
      }, i * 200);
    }
  }
}
