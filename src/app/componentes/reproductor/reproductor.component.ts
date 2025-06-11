import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reproductor',
  standalone: true,
  templateUrl: './reproductor.component.html',
  styleUrl: './reproductor.component.css'
})
export class ReproductorComponent {
  @Input() previewUrl: string | null = null;
  audio: HTMLAudioElement | null = null;
  isPlaying = false;

  togglePlay() {
    if (!this.previewUrl) return;

    if (!this.audio) {
      this.audio = new Audio(this.previewUrl);
      console.log('Cargando preview:', this.previewUrl);
    }


    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }

    this.isPlaying = !this.isPlaying;
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }
}
