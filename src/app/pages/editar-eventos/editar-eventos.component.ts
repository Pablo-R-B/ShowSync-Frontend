import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { EstadoService } from '../../servicios/estado.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../../servicios/eventos.service';
import { SalasService } from '../../servicios/salas.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Sala } from '../../interfaces/sala';
import { EventoActualizado } from '../../interfaces/EventoActualizado';
import { Artistas } from '../../interfaces/artistas';
import { ArtistasService } from '../../servicios/artistas.service';
import { GenerosMusicalesService } from '../../servicios/generos-musicales.service';
import { AuthService } from '../../servicios/auth.service';
import { forkJoin, Observable } from 'rxjs';
import { GeneroMusicalDTO } from '../../interfaces/GeneroMusicalDTO';
import { ArtistaEvento } from '../../interfaces/ArtistaEvento';
import { PromotoresService } from '../../servicios/promotores.service';
import { Promotor } from '../../interfaces/Promotor';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

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
export class EditarEventosComponent implements OnInit {
  editarEventoForm!: FormGroup;
  salaAsignada: Sala | null = null; // Solo la sala del evento
  estados: string[] = [];
  artistasDisponibles: Artistas[] = [];
  generosMusicalesDisponibles: GeneroMusicalDTO[] = [];

  artistasAsignados: ArtistaEvento[] = [];
  artistasOriginales: ArtistaEvento[] = [];
  dropdownVisible: boolean = false;

  selectedGenreIds: number[] = [];
  originalGenreIds: number[] = [];

  loading = true;
  idEvento!: number;
  promotorId!: number;
  salaOriginalId!: number;

  imagenPreviaUrl: string | null = null;
  archivoImagen: File | null = null;
  errorMensaje: string | null = null;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

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
      idSala: [{ value: '', disabled: true }, Validators.required],
      estado: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const authenticatedUserId = parseInt(localStorage.getItem('userId') ?? '0', 10);

    if (!authenticatedUserId || authenticatedUserId === 0) {
      this.showErrorNotification('No se pudo obtener el ID del usuario. Por favor, inicie sesión.');
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    this.promotoresService.getPromotorPorIdUsuario(authenticatedUserId).subscribe({
      next: (promotor: Promotor) => {
        if (promotor && promotor.id) {
          this.promotorId = promotor.id;
          const eventoParam = this.route.snapshot.paramMap.get('idEvento');
          if (eventoParam) {
            this.idEvento = +eventoParam;
            this.cargarTodoElFormulario();
          } else {
            this.showErrorNotification('No se encontró el evento para editar.');
            this.loading = false;
          }
        } else {
          this.showErrorNotification('El usuario no tiene un perfil de promotor asociado.');
          this.loading = false;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.showErrorNotification(error.error?.message || error.message || 'Error al cargar el perfil del promotor.');
        this.loading = false;
      }
    });
  }

  private cargarTodoElFormulario(): void {
    this.loading = true;
    this.errorMensaje = null;

    // Primero obtenemos los datos del evento para conocer el idSala
    this.eventoService.obtenerEventoDetalleParaEdicion(this.idEvento).subscribe({
      next: (evento) => {
        this.salaOriginalId = evento.idSala;

        // Ahora cargamos todos los datos incluyendo solo la sala específica
        forkJoin({
          estados: this.estadoService.getEstados() as Observable<string[]>,
          salaAsignada: this.salaService.obtenerPorId(this.salaOriginalId) as Observable<Sala>,
          artistasPromotor: this.artistasService.artistasPorPromotor(this.promotorId) as Observable<Artistas[]>,
          generos: this.generosMusicalesService.listarGeneros() as Observable<GeneroMusicalDTO[]>
        }).subscribe({
          next: ({ estados, salaAsignada, artistasPromotor, generos }) => {
            this.estados = estados;
            this.salaAsignada = salaAsignada;
            this.artistasDisponibles = artistasPromotor;
            this.generosMusicalesDisponibles = generos;

            // Rellenar el formulario con los datos del evento
            this.editarEventoForm.patchValue({
              nombreEvento: evento.nombreEvento,
              descripcion: evento.descripcion,
              idSala: this.salaAsignada.nombre,
              estado: evento.estado,
            });

            this.imagenPreviaUrl = evento.imagenEvento || null;

            if (evento.artistasAsignados && Array.isArray(evento.artistasAsignados)) {
              this.artistasAsignados = this.processArtistas(evento.artistasAsignados);
              this.artistasOriginales = [...this.artistasAsignados];
            }

            this.selectedGenreIds = evento.generosMusicales?.map((g: any) => g.id) || [];
            this.originalGenreIds = [...this.selectedGenreIds];

            this.loading = false;
          },
          error: (err: HttpErrorResponse) => {
            this.showErrorNotification(err.error?.message || 'Error al cargar los datos del evento.');
            this.loading = false;
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        this.showErrorNotification(err.error?.message || 'Error al cargar los datos del evento.');
        this.loading = false;
      }
    });
  }

  private processArtistas(artistas: any[]): ArtistaEvento[] {
    return artistas.map((item: string | ArtistaEvento) => {
      if (typeof item === 'object' && item !== null && 'id' in item && 'nombreArtista' in item) {
        return item as ArtistaEvento;
      } else if (typeof item === 'string') {
        const artistaCompleto = this.artistasDisponibles.find(a => a.nombreArtista === item);
        if (artistaCompleto) {
          return {
            id: artistaCompleto.id,
            nombreArtista: artistaCompleto.nombreArtista,
            imagenPerfil: artistaCompleto.imagenPerfil
          };
        }
        return { id: 0, nombreArtista: item, imagenPerfil: 'https://placehold.co/50?text=No+Img' };
      }
      return { id: 0, nombreArtista: 'Desconocido', imagenPerfil: 'https://placehold.co/50?text=Error' };
    }).sort((a, b) => a.nombreArtista.localeCompare(b.nombreArtista));
  }

  hasChanges(): boolean {
    // Verificar cambios en campos del formulario
    const formValues = this.editarEventoForm.value;
    const formChanged = this.editarEventoForm.dirty;

    // Verificar cambios en artistas
    const artistasChanged = JSON.stringify(this.artistasAsignados.map(a => a.id)) !==
      JSON.stringify(this.artistasOriginales.map(a => a.id));

    // Verificar cambios en géneros
    const generosChanged = JSON.stringify(this.selectedGenreIds.sort()) !==
      JSON.stringify(this.originalGenreIds.sort());

    // Verificar cambios en imagen
    const imagenChanged = this.archivoImagen !== null;

    return formChanged || artistasChanged || generosChanged || imagenChanged;
  }

  showSuccessNotification(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'success';
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 5000);
  }

  showErrorNotification(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
    setTimeout(() => this.showNotification = false, 5000);
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeMB = 5;

    if (!allowedTypes.includes(file.type)) {
      this.showErrorNotification('Solo se aceptan imágenes JPG, PNG o WEBP.');
      input.value = '';
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      this.showErrorNotification(`El archivo supera el tamaño máximo de ${maxSizeMB}MB.`);
      input.value = '';
      return;
    }

    this.archivoImagen = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreviaUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    this.editarEventoForm.markAllAsTouched();

    if (this.artistasAsignados.length === 0) {
      this.showErrorNotification('Debe seleccionar al menos un artista.');
      return;
    }
    if (this.selectedGenreIds.length === 0) {
      this.showErrorNotification('Debe seleccionar al menos un género musical.');
      return;
    }
    if (this.editarEventoForm.invalid) {
      this.showErrorNotification('Complete todos los campos requeridos.');
      return;
    }

    this.loading = true;
    this.errorMensaje = null;

    const eventoAEnviar: EventoActualizado = {
      id: this.idEvento,
      nombreEvento: this.editarEventoForm.get('nombreEvento')?.value,
      descripcion: this.editarEventoForm.get('descripcion')?.value,
      idSala: this.salaOriginalId,
      estado: this.editarEventoForm.get('estado')?.value,
      imagenEvento: this.imagenPreviaUrl || '',
      artistasAsignados: this.artistasAsignados,
      generosMusicalesIds: this.selectedGenreIds
    };

    this.eventoService.actualizarEvento(
      this.promotorId,
      this.idEvento,
      eventoAEnviar,
      this.archivoImagen ?? undefined
    ).subscribe({
      next: () => {
        this.loading = false;
        this.showSuccessNotification('Evento editado correctamente.');
        setTimeout(() => this.router.navigate(['/perfil-promotores']), 1500);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.showErrorNotification(error.error?.message || 'Error al editar el evento.');
      }
    });
  }

  navigateToPerfilPromotores(): void {
    this.router.navigate(['/perfil-promotores']);
  }
}
