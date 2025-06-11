import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-music-player',
  standalone: true,
  imports: [NgIf],
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css'],
})
export class MusicPlayerComponent {

  @Input() musicUrl?: string;
  safeUrl?: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges() {
    if (this.musicUrl) {
      const embedUrl = this.getEmbedUrl(this.musicUrl);
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else {
      this.safeUrl = undefined;
    }
  }

  getEmbedUrl(url: string): string {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
  }
}
