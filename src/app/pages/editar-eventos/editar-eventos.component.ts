import {Component, NgIterable, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {EstadoService} from '../../servicios/estado.service';
import {ActivatedRoute} from '@angular/router';
import {EventosService} from '../../servicios/eventos.service';
import {SalasService} from '../../servicios/salas.service';

@Component({
  selector: 'app-editar-eventos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './editar-eventos.component.html',
  styleUrls: ['./editar-eventos.component.css']
})
export class EditarEventosComponent implements OnInit{
  editarEventoForm: FormGroup;
  loading: boolean = false;
  estados: string[] = [];
  eventoId!: number;
  promotorId!: number;
  salas: { id: number; nombre: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private estadoService: EstadoService,
    private eventosService: EventosService,
    private salasService: SalasService,
    private route: ActivatedRoute
  ) {
    this.editarEventoForm = this.fb.group({
      nombreEvento: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      fechaEvento: ['', [Validators.required]],
      salaId: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      imagenEvento: ['']
    });
  }

  ngOnInit(): void {
    // Cargar estados disponibles
    this.estadoService.getEstados().subscribe({
      next: (data) => this.estados = data,
      error: (err) => console.error('Error al cargar estados:', err)
    });

    // Obtener IDs desde ruta
    const promotorParam = this.route.snapshot.paramMap.get('idPromotor');
    const eventoParam = this.route.snapshot.paramMap.get('idEvento');

    if (promotorParam && eventoParam) {
      this.promotorId = +promotorParam;
      this.eventoId = +eventoParam;

      // Cargar evento
      this.cargarEvento(this.promotorId, this.eventoId);
    } else {
      console.error('Faltan parámetros de promotor o evento en la ruta');
    }

    // Cargar salas para el select
    this.salasService.obtenerTodas().subscribe({
      next: (data: { id: number; nombre: string; }[]) => this.salas = data,
      error: (err: any) => console.error('Error al cargar salas:', err)
    });
  }

  private cargarEvento(promotorId: number, eventoId: number): void {
    this.eventosService.getEventoPorPromotor(promotorId, eventoId).subscribe({
      next: (evento) => {
        // Convertir fechaEvento array a string YYYY-MM-DD
        let fechaString = '';
        if (evento.fechaEvento && Array.isArray(evento.fechaEvento) && evento.fechaEvento.length === 3) {
          const [year, month, day] = evento.fechaEvento;
          const mm = month.toString().padStart(2, '0');
          const dd = day.toString().padStart(2, '0');
          fechaString = `${year}-${mm}-${dd}`;
        }

        this.editarEventoForm.patchValue({
          nombreEvento: evento.nombreEvento,
          descripcion: evento.descripcion,
          fechaEvento: fechaString,
          salaId: evento.idSala,
          estado: evento.estado,
          imagenEvento: evento.imagenEvento
        });
      },
      error: (err) => {
        console.error('Error al cargar el evento:', err);
      }
    });
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.editarEventoForm.get(controlName);
    return control ? control.hasError(errorCode) && control.touched : false;
  }

  onSubmit(): void {
    if (this.editarEventoForm.valid) {
      this.loading = true;

      const formData = this.editarEventoForm.value;

      if (!formData.salaId) {
        console.error('Error: salaId está vacío o no válido');
        this.loading = false;
        return;
      }

      // Aquí usamos directamente el string de la fecha, no el array
      const eventoActualizar = {
        nombre_evento: formData.nombreEvento,
        descripcion: formData.descripcion,
        fecha_evento: formData.fechaEvento, // string 'YYYY-MM-DD'
        sala_id: { id: Number(formData.salaId) },
        estado: formData.estado,
        imagen_evento: formData.imagenEvento
      };

      this.eventosService.editarEvento(this.promotorId, this.eventoId, eventoActualizar).subscribe({
        next: () => {
          console.log('Evento actualizado correctamente');
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al actualizar el evento:', err);
          this.loading = false;
        }
      });
    } else {
      console.log('Formulario inválido');
    }
  }


}
