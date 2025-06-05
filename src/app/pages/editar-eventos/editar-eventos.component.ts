import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { EstadoService } from '../../servicios/estado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../../servicios/eventos.service';
import { SalasService } from '../../servicios/salas.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Sala } from '../../interfaces/sala';
import { EventoActualizado } from '../../interfaces/EventoActualizado';


@Component({
  selector: 'app-editar-eventos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    FormsModule
  ],
  templateUrl: './editar-eventos.component.html',
  styleUrls: ['./editar-eventos.component.css']
})
export class EditarEventosComponent implements OnInit{
  editarEventoForm: FormGroup;
  nuevoArtistaControl = new FormControl('');
  artistasSeleccionados: string[] = [];
  salas: Sala[] = [];
  estados: string[] = [];
  estadosPublicacion: string[] = [];
  dropdownVisible = false;
  loading = false;
  idEvento!: number;
  promotorId!: number;

  constructor(
    private fb: FormBuilder,
    private eventoService: EventosService,
    private estadoService: EstadoService,
    private salaService: SalasService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editarEventoForm = this.fb.group({
      nombreEvento: ['', Validators.required],
      descripcion: [''],
      idSala: ['', Validators.required],
      estado: ['', Validators.required],
      imagenEvento: [''],
      artistasAsignados: [[], Validators.required],
      estadoPublicacion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.estadoService.getEstados().subscribe({
      next: (data: string[]) => this.estados = data,
      error: (err: any) => console.error('Error al cargar estados:', err)
    });

    const promotorParam = this.route.snapshot.paramMap.get('idPromotor');
    const eventoParam = this.route.snapshot.paramMap.get('idEvento');

    if (promotorParam && eventoParam) {
      this.promotorId = +promotorParam;
      this.idEvento = +eventoParam;
      this.cargarEvento(this.promotorId, this.idEvento);
    } else {
      console.error('Faltan parámetros de promotor o evento en la ruta');
    }

    this.salaService.obtenerTodas().subscribe({
      next: (data: Sala[]) => this.salas = data,
      error: (err: any) => console.error('Error al cargar salas:', err)
    });
  }

  private cargarEvento(promotorId: number, eventoId: number): void {
    this.eventoService.getEventoPorPromotor(promotorId, eventoId).subscribe({
      next: (evento: any) => {
        this.editarEventoForm.patchValue({
          nombreEvento: evento.nombreEvento,
          descripcion: evento.descripcion,
          idSala: evento.idSala,
          estado: evento.estado,
          imagenEvento: evento.imagenEvento
        });
      },
      error: (err: any) => {
        console.error('Error al cargar el evento:', err);
      }
    });
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.editarEventoForm.get(controlName);
    return control ? control.touched && control.hasError(error) : false;
  }

  toggleDropdown() {
    this.dropdownVisible = !this.dropdownVisible;
  }

  agregarArtista() {
    const nuevo = this.nuevoArtistaControl.value?.trim();
    if (nuevo && !this.artistasSeleccionados.includes(nuevo)) {
      this.artistasSeleccionados.push(nuevo);
      this.editarEventoForm.get('artistasAsignados')?.setValue(this.artistasSeleccionados);
      this.nuevoArtistaControl.reset();
    }
  }

  eliminarArtista(artista: string) {
    this.artistasSeleccionados = this.artistasSeleccionados.filter(a => a !== artista);
    this.editarEventoForm.get('artistasAsignados')?.setValue(this.artistasSeleccionados);
  }

  onSubmit() {
    if (this.editarEventoForm.invalid) {
      this.editarEventoForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const eventoEditado: EventoActualizado = this.editarEventoForm.value;
    const idPromotor = Number(this.route.snapshot.paramMap.get('idPromotor'));

    this.eventoService.actualizarEvento(idPromotor, this.idEvento, eventoEditado).subscribe({
      next: () => {
        this.loading = false;
        alert('Evento editado correctamente.');
        this.router.navigate(['/eventos']);
      },
      error: (error: any) => {
        this.loading = false;
        alert('Error al editar el evento.');
        console.error(error);
      }
    });
  }
}

