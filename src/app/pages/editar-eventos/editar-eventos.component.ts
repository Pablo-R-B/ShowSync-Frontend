import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import { EstadoService } from '../../servicios/estado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../../servicios/eventos.service';
import { SalasService } from '../../servicios/salas.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Sala } from '../../interfaces/sala';
import { EventoActualizado } from '../../interfaces/EventoActualizado';
import {Artistas} from '../../interfaces/artistas';
import {ArtistasService} from '../../servicios/artistas.service';
import {GenerosMusicalesService} from '../../servicios/generos-musicales.service';
import {AuthService} from '../../servicios/auth.service';
import {forkJoin, Observable} from 'rxjs';
import {GeneroMusicalDTO} from '../../interfaces/GeneroMusicalDTO';
import {ArtistaEvento} from '../../interfaces/ArtistaEvento';





@Component({
  selector: 'app-editar-eventos',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    FormsModule,
    CommonModule
  ],
  templateUrl: './editar-eventos.component.html',
  styleUrls: ['./editar-eventos.component.css']
})
export class EditarEventosComponent implements OnInit{
  editarEventoForm!: FormGroup;
  salas: Sala[] = [];
  estados: string[] = [];
  artistasDisponibles: Artistas[] = [];
  generosMusicalesDisponibles: GeneroMusicalDTO[] = [];

  artistasAsignados: ArtistaEvento[] = []; // Artists currently assigned to this event
  dropdownVisible: boolean = false;

  selectedGenreIds: number[] = [];

  loading = true;
  idEvento!: number;
  promotorId!: number;

  imagenPreviaUrl: string | null = null;
  archivoImagen: File | null = null;
  errorMensaje: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventoService: EventosService,
    private estadoService: EstadoService,
    private salaService: SalasService,
    private artistasService: ArtistasService,
    private generosMusicalesService: GenerosMusicalesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editarEventoForm = this.fb.group({
      nombreEvento: ['', Validators.required],
      descripcion: ['', Validators.required],
      idSala: ['', Validators.required],
      estado: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.promotorId = this.authService.userId;
    if (!this.promotorId) {
      this.errorMensaje = 'No se pudo obtener el ID del promotor. Por favor, inicie sesión.';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    const eventoParam = this.route.snapshot.paramMap.get('idEvento');
    if (eventoParam) {
      this.idEvento = +eventoParam;
      this.cargarTodoElFormulario();
    } else {
      console.error('Falta el ID del evento en la ruta');
      this.errorMensaje = 'No se encontró el evento para editar.';
      this.loading = false;
    }
  }

  private cargarTodoElFormulario(): void {
    this.loading = true;
    this.errorMensaje = null;

    forkJoin({
      estados: this.estadoService.getEstados() as Observable<string[]>,
      salas: this.salaService.obtenerTodas() as Observable<Sala[]>,
      artistasPromotor: this.artistasService.artistasPorPromotor(this.promotorId) as Observable<Artistas[]>,
      generos: this.generosMusicalesService.listarGeneros() as Observable<GeneroMusicalDTO[]>,
      evento: this.eventoService.obtenerEventoDetalleParaEdicion(this.idEvento) as Observable<EventoActualizado>
    }).subscribe({
      next: ({ estados, salas, artistasPromotor, generos, evento }) => {
        this.estados = estados;
        this.salas = salas;
        this.artistasDisponibles = artistasPromotor;
        this.generosMusicalesDisponibles = generos;
        console.log('Géneros disponibles (todos):', this.generosMusicalesDisponibles);
        console.log('Géneros del evento (del backend):', evento.generosMusicales);

        this.editarEventoForm.patchValue({
          nombreEvento: evento.nombreEvento,
          descripcion: evento.descripcion,
          idSala: evento.idSala,
          estado: evento.estado,
        });

        this.imagenPreviaUrl = evento.imagenEvento || null;

        // Populate artistasAsignados and selectedGenreIds based on fetched event
        // Backend's ArtistasDTO should have nombreArtista here
        this.artistasAsignados = evento.artistasAsignados || [];
        this.selectedGenreIds = evento.generosMusicales?.map(g => g.id) || [];

        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar datos del formulario:', err);
        this.errorMensaje = err.error?.message || err.error?.detail || JSON.stringify(err.error) || 'Error desconocido al cargar la información necesaria para editar el evento.';
        this.loading = false;
      }
    });
  }

  toggleDropdown(): void {
    this.dropdownVisible = !this.dropdownVisible;
  }

  addArtist(artist: Artistas): void {
    if (!this.artistasAsignados.some(a => a.id === artist.id)) {
      this.artistasAsignados.push({
        id: artist.id,
        nombreArtista: artist.nombreArtista, // <-- Use nombreArtista
        imagenPerfil: artist.imagenPerfil
      });
      this.artistasAsignados.sort((a, b) => a.nombreArtista.localeCompare(b.nombreArtista)); // <-- Use nombreArtista for sorting
    }
  }

  removeArtist(artistId: number): void {
    this.artistasAsignados = this.artistasAsignados.filter(a => a.id !== artistId);
  }

  onGenreCheckboxChange(event: Event, genreId: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedGenreIds = [...this.selectedGenreIds, genreId];
    } else {
      this.selectedGenreIds = this.selectedGenreIds.filter(id => id !== genreId);
    }
  }

  isGenreSelected(genreId: number): boolean {
    return this.selectedGenreIds.includes(genreId);
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.editarEventoForm.get(controlName);
    return control ? control.hasError(error) && (control.touched || control.dirty) : false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.archivoImagen = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreviaUrl = reader.result as string;
      };
      reader.readAsDataURL(this.archivoImagen);
    } else {
      this.archivoImagen = null;
    }
  }

  onSubmit() {
    this.editarEventoForm.markAllAsTouched();
    if (this.artistasAsignados.length === 0) {
      this.errorMensaje = 'Debe seleccionar al menos un artista.';
      return;
    }
    if (this.selectedGenreIds.length === 0) {
      this.errorMensaje = 'Debe seleccionar al menos un género musical.';
      return;
    }
    if (this.editarEventoForm.invalid) {
      this.errorMensaje = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    this.loading = true;
    this.errorMensaje = null;

    const formData = new FormData();

    const eventoEditado: EventoActualizado = {
      nombreEvento: this.editarEventoForm.get('nombreEvento')?.value,
      descripcion: this.editarEventoForm.get('descripcion')?.value,
      idSala: this.editarEventoForm.get('idSala')?.value,
      estado: this.editarEventoForm.get('estado')?.value,
      imagenEvento: this.imagenPreviaUrl || '',
      artistasAsignados: this.artistasAsignados, // Send the ArtistaEvento objects
      generosMusicalesIds: this.selectedGenreIds // Send array of genre IDs
    };

    if (this.archivoImagen) {
      formData.append('imagenArchivo', this.archivoImagen, this.archivoImagen.name);
      eventoEditado.imagenEvento = '';
    } else if (this.imagenPreviaUrl) {
      eventoEditado.imagenEvento = this.imagenPreviaUrl;
    } else {
      eventoEditado.imagenEvento = '';
    }

    formData.append('evento', new Blob([JSON.stringify(eventoEditado)], { type: 'application/json' }));

    this.eventoService.actualizarEvento(this.promotorId, this.idEvento, formData).subscribe({
      next: () => {
        this.loading = false;
        alert('Evento editado correctamente.');
        this.router.navigate(['/perfil-promotores']);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMensaje = error.error?.message || error.error?.detail || JSON.stringify(error.error) || 'Error desconocido al editar el evento.';
        console.error('Error al actualizar el evento:', error);
      }
    });
  }

  navigateToPerfilPromotores(): void {
    this.router.navigate(['/perfil-promotores']);
  }
}
