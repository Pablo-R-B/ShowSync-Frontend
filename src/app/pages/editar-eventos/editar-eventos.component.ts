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
import {PromotoresService} from '../../servicios/promotores.service';
import {Promotor} from '../../interfaces/Promotor';

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

  artistasAsignados: ArtistaEvento[] = [];
  dropdownVisible: boolean = false;

  selectedGenreIds: number[] = [];

  loading = true;
  idEvento!: number;
  promotorId!: number;
  salaOriginalId!: number; // Nueva variable para almacenar el ID original de la sala

  imagenPreviaUrl: string | null = null;
  archivoImagen: File | null = null;
  errorMensaje: string | null = null;

  constructor(
    private fb: FormBuilder,
    private eventoService: EventosService,
    private estadoService: EstadoService,
    private salaService: SalasService,
    private artistasService: ArtistasService,
    private promotoresService: PromotoresService,
    private generosMusicalesService: GenerosMusicalesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editarEventoForm = this.fb.group({
      nombreEvento: ['', Validators.required],
      descripcion: ['', Validators.required],
      idSala: [{value: '', disabled: true}, Validators.required], // Campo deshabilitado
      estado: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const authenticatedUserId = parseInt(localStorage.getItem('userId') ?? '0', 10);

    if (!authenticatedUserId || authenticatedUserId === 0) {
      this.errorMensaje = 'No se pudo obtener el ID del usuario autenticado. Por favor, inicie sesión.';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.promotoresService.getPromotorPorIdUsuario(authenticatedUserId).subscribe({
      next: (promotor: Promotor) => {
        if (promotor && promotor.id) {
          this.promotorId = promotor.id;
          console.log('ID de usuario autenticado:', authenticatedUserId);
          console.log('Promotor recibido (id_promotor: ' + promotor.id + ', usuarioId: ' + promotor.id+ '):', promotor);
          console.log('ID del promotor para operaciones:', this.promotorId);

          const eventoParam = this.route.snapshot.paramMap.get('idEvento');
          if (eventoParam) {
            this.idEvento = +eventoParam;
            this.cargarTodoElFormulario();
          } else {
            console.error('Falta el ID del evento en la ruta');
            this.errorMensaje = 'No se encontró el evento para editar.';
            this.loading = false;
          }
        } else {
          this.errorMensaje = 'El usuario autenticado no tiene un perfil de promotor asociado.';
          this.loading = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error al obtener el perfil del promotor:', error);
        this.errorMensaje = error.error?.message || error.message || 'Error desconocido al cargar el perfil del promotor.';
        this.loading = false;
      }
    });
  }

  private cargarTodoElFormulario(): void {
    this.loading = true;
    this.errorMensaje = null;

    forkJoin({
      estados: this.estadoService.getEstados() as Observable<string[]>,
      salas: this.salaService.obtenerTodas() as Observable<Sala[]>,
      artistasPromotor: this.artistasService.artistasPorPromotor(this.promotorId) as Observable<Artistas[]>,
      generos: this.generosMusicalesService.listarGeneros() as Observable<GeneroMusicalDTO[]>,
      evento: this.eventoService.obtenerEventoDetalleParaEdicion(this.idEvento) as Observable<any>
    }).subscribe({
      next: ({ estados, salas, artistasPromotor, generos, evento }) => {
        this.estados = estados;
        this.salas = salas;
        this.artistasDisponibles = artistasPromotor;
        this.generosMusicalesDisponibles = generos;

        // Guardamos el ID original de la sala
        this.salaOriginalId = evento.idSala;

        // Buscamos el nombre de la sala correspondiente al ID original
        const salaOriginal = this.salas.find(s => s.id === this.salaOriginalId);
        const nombreSalaOriginal = salaOriginal ? salaOriginal.nombre: 'Sala no encontrada';

        this.editarEventoForm.patchValue({
          nombreEvento: evento.nombreEvento,
          descripcion: evento.descripcion,
          idSala: nombreSalaOriginal, // Mostramos el nombre de la sala en lugar del ID
          estado: evento.estado,
        });

        this.imagenPreviaUrl = evento.imagenEvento || null;

        if (evento.artistasAsignados && Array.isArray(evento.artistasAsignados) && evento.artistasAsignados.length > 0) {
          this.artistasAsignados = evento.artistasAsignados.map((item: string | ArtistaEvento) => {
            if (typeof item === 'object' && item !== null && 'id' in item && 'nombreArtista' in item) {
              return item as ArtistaEvento;
            }
            else if (typeof item === 'string') {
              const nombreArtistaDelBackend = item;
              const artistaCompleto = this.artistasDisponibles.find(
                a => a.nombreArtista === nombreArtistaDelBackend
              );
              if (artistaCompleto) {
                return {
                  id: artistaCompleto.id,
                  nombreArtista: artistaCompleto.nombreArtista,
                  imagenPerfil: artistaCompleto.imagenPerfil
                } as ArtistaEvento;
              } else {
                console.warn(`Artista "${nombreArtistaDelBackend}" del evento (ID: ${this.idEvento}) no encontrado en la lista de artistas disponibles.`);
                return { id: 0, nombreArtista: nombreArtistaDelBackend, imagenPerfil: 'https://via.placeholder.com/50?text=No+Img' } as ArtistaEvento;
              }
            }
            console.warn(`Formato inesperado para artista asignado: ${item}`);
            return { id: 0, nombreArtista: 'Desconocido', imagenPerfil: 'https://via.placeholder.com/50?text=Error' } as ArtistaEvento;
          });
          this.artistasAsignados.sort((a, b) => a.nombreArtista.localeCompare(b.nombreArtista));
        } else {
          this.artistasAsignados = [];
        }

        this.selectedGenreIds = evento.generosMusicales?.map((g: any) => g.id) || [];

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
        nombreArtista: artist.nombreArtista,
        imagenPerfil: artist.imagenPerfil
      });
      this.artistasAsignados.sort((a, b) => a.nombreArtista.localeCompare(b.nombreArtista));
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
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se aceptan JPG, PNG o WEBP.');
      return;
    }

    // Validar tamaño
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`El archivo supera el tamaño máximo de ${maxSizeMB}MB.`);
      return;
    }

    this.archivoImagen = file;

    // Previsualización
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreviaUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
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

    const eventoAEnviar: EventoActualizado = {
      id: this.idEvento,
      nombreEvento: this.editarEventoForm.get('nombreEvento')?.value,
      descripcion: this.editarEventoForm.get('descripcion')?.value,
      idSala: this.salaOriginalId, // Usamos el ID original de la sala guardado
      estado: this.editarEventoForm.get('estado')?.value,
      imagenEvento: this.imagenPreviaUrl || '',
      artistasAsignados: this.artistasAsignados,
      generosMusicalesIds: this.selectedGenreIds
    };

    this.eventoService.actualizarEvento(
      this.promotorId,
      this.idEvento,
      eventoAEnviar,
      this.archivoImagen ?? undefined // <- esto es lo que faltaba
    ).subscribe({
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

  mostrarMensajeSala() {
    alert('No puedes modificar la sala');
  }
}
