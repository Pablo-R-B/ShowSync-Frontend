import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SalaService } from '../../servicios/sala.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgIf } from '@angular/common';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions } from '@fullcalendar/core'; // 👈 Import necesario

@Component({
  selector: 'app-perfil-sala',
  standalone: true,
  imports: [
    FullCalendarModule,
    NgIf
  ],
  templateUrl: './perfil-sala.component.html'
})
export class PerfilSalaComponent implements OnInit {
  sala: any;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin], // ✅ Asegúrate de tener el plugin aquí
    initialView: 'dayGridMonth',
    events: []
  };

  constructor(
    private route: ActivatedRoute,
    private salaService: SalaService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.salaService.getSalaById(id).subscribe(sala => this.sala = sala);

      // Generar fechas entre hoy y 30 días después
      const hoy = new Date();
      const fin = new Date();
      fin.setDate(hoy.getDate() + 30);

      const inicioStr = hoy.toISOString().split('T')[0];
      const finStr = fin.toISOString().split('T')[0];

      this.salaService.getDisponibilidad(id, inicioStr, finStr).subscribe(disponibilidad => {
        const eventos = disponibilidad.map((d: any) => ({
          title: d.disponibilidad ? 'Disponible' : 'Ocupado',
          date: d.fecha,
          color: d.disponibilidad ? 'green' : 'red'
        }));

        // Actualizamos calendarOptions con los eventos cargados
        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos
        };
      });
    }
  }
}
