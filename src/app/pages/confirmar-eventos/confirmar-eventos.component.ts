import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {EstadoService} from '../../servicios/estado.service';
import {EventosService} from '../../servicios/eventos.service';
import {SalasService} from '../../servicios/salas.service';
import {ActivatedRoute} from '@angular/router';
import {EventoBackendDTO} from '../../interfaces/EventoBackendDTO'


@Component({
  selector: 'app-confirmar-eventos',
    imports: [
        FormsModule,
        NgForOf,
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './confirmar-eventos.component.html',
  styleUrl: './confirmar-eventos.component.css'
})
export class ConfirmarEventosComponent implements OnInit{
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
      salaId: ['', Validators.required],
      estado: ['', Validators.required],
      imagenEvento: ['']
    });
  }

  ngOnInit(): void {
        this.estadoService.getEstados().subscribe({
          next: (data) => this.estados = data,
          error: (err) => console.error('Error al cargar estados:', err)
    });

    const promotorParam = this.route.snapshot.paramMap.get('idPromotor');
    const eventoParam = this.route.snapshot.paramMap.get('idEvento');

    if (promotorParam && eventoParam) {
      this.promotorId = +promotorParam;
      this.eventoId = +eventoParam;
      this.cargarEvento(this.promotorId, this.eventoId);
    } else {
      console.error('Faltan parámetros de promotor o evento en la ruta');
    }

    this.salasService.obtenerTodas().subscribe({
      next: (data) => this.salas = data,
      error: (err) => console.error('Error al cargar salas:', err)
    });
  }

  private cargarEvento(promotorId: number, eventoId: number): void {
    this.eventosService.getEventoPorPromotor(promotorId, eventoId).subscribe({
      next: (evento) => {
        this.editarEventoForm.patchValue({
          nombreEvento: evento.nombreEvento,
          descripcion: evento.descripcion,
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

  onSubmit(): void {
    if (this.editarEventoForm.valid) {
      this.loading = true;

      const formData = this.editarEventoForm.value;

      const eventoActualizar: EventoBackendDTO = {
        nombre_evento: formData.nombreEvento,
        descripcion: formData.descripcion,
        sala: { id: Number(formData.salaId) },
        estado: formData.estado,
        imagen_evento: formData.imagenEvento,

      };

      this.eventosService.editarEvento(this.promotorId, this.eventoId, eventoActualizar).subscribe({
        next: () => {
          console.log('✅ Evento actualizado correctamente');
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error al actualizar el evento:', err);
          this.loading = false;
        }
      });
    } else {
      console.warn('⚠️ Formulario inválido', this.editarEventoForm.value);
    }
  }

  // @ts-ignore
  hasError(controlName: string, errorName: string): boolean {
    const control = this.editarEventoForm.get(controlName);

  }
}
