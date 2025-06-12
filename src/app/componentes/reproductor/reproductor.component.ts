import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-reproductor',
  standalone: true,
  imports: [NgIf], // 👈 Añadir aquí

  templateUrl: './reproductor.component.html',
  styleUrls: ['./reproductor.component.css']
})
export class ReproductorComponent implements OnChanges {
  @Input() musicUrl?: string;
  embedUrl?: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['musicUrl'] && this.musicUrl) {
      // Opcional: Puedes validar que sea un link Spotify embed válido
      this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.musicUrl);
    }
  }
}
