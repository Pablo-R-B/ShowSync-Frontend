import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-mapa-direccion',
  templateUrl: './mapa-direccion.component.html',
  imports: [
    NgIf,
    NgForOf
  ],
  styleUrls: ['./mapa-direccion.component.css']
})
export class MapaDireccionComponent implements OnInit {
  @Output() seleccionoDireccion = new EventEmitter<{ lat: number; lon: number; display_name: string }>();

  private map!: L.Map;
  private searchTerm = new Subject<string>();
  sugerencias: any[] = [];
  marcador?: L.Marker;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Inicializa el mapa centrado en Madrid
    this.map = L.map('map').setView([40.4168, -3.7038], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Escucha las búsquedas con debounce
    this.searchTerm.pipe(
      debounceTime(300),
      switchMap(term =>
        this.http.get<any[]>(`https://nominatim.openstreetmap.org/search?format=json&q=${term}`)
      )
    ).subscribe(resultados => {
      this.sugerencias = resultados;
    });
  }

  buscarDireccion(texto: string) {
    if (texto.length > 2) {
      this.searchTerm.next(texto);
    } else {
      this.sugerencias = [];
    }
  }

  seleccionarDireccion(direccion: any) {
    this.sugerencias = [];
    const lat = parseFloat(direccion.lat);
    const lon = parseFloat(direccion.lon);

    if (this.marcador) {
      this.map.removeLayer(this.marcador);
    }
    this.marcador = L.marker([lat, lon]).addTo(this.map);
    this.map.setView([lat, lon], 15);

    this.seleccionoDireccion.emit({ lat, lon, display_name: direccion.display_name });
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.buscarDireccion(input.value);
  }
}
