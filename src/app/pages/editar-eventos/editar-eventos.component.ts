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
    private promotoresService: PromotoresService,
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
    // Paso 1: Obtener el ID del USUARIO autenticado (el 24)
    const authenticatedUserId = parseInt(localStorage.getItem('userId') ?? '0', 10); // O this.authService.userId; si ya lo tienes accesible

    if (!authenticatedUserId || authenticatedUserId === 0) {
      this.errorMensaje = 'No se pudo obtener el ID del usuario autenticado. Por favor, inicie sesión.';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    // Paso 2: Usar el ID del USUARIO para obtener el objeto Promotor completo, y de ahí su ID_PROMOTOR (el 7)
    this.promotoresService.getPromotorPorIdUsuario(authenticatedUserId).subscribe({
      next: (promotor: Promotor) => { // Asegúrate de que Promotor está bien tipado
        if (promotor && promotor.id) {
          this.promotorId = promotor.id; // <--- ¡AQUÍ ESTÁ LA CLAVE! Guardamos el ID_PROMOTOR correcto
          console.log('ID de usuario autenticado:', authenticatedUserId);
          console.log('Promotor recibido (id_promotor: ' + promotor.id + ', usuarioId: ' + promotor.id+ '):', promotor);
          console.log('ID del promotor para operaciones (el que se usará en la URL):', this.promotorId);

          // Paso 3: Una vez que tenemos el ID del promotor, podemos cargar el formulario del evento
          const eventoParam = this.route.snapshot.paramMap.get('idEvento');
          if (eventoParam) {
            this.idEvento = +eventoParam;
            this.cargarTodoElFormulario(); // Tu método para cargar el formulario del evento
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
      // Asegúrate de que `artistasPorPromotor` devuelve los objetos `Artistas` completos (con ID, nombre, imagen)
      artistasPromotor: this.artistasService.artistasPorPromotor(this.promotorId) as Observable<Artistas[]>,
      generos: this.generosMusicalesService.listarGeneros() as Observable<GeneroMusicalDTO[]>,
      // Cambiamos el tipo de `evento` a `any` para manejar el formato mixto del backend
      evento: this.eventoService.obtenerEventoDetalleParaEdicion(this.idEvento) as Observable<any>
    }).subscribe({
      next: ({ estados, salas, artistasPromotor, generos, evento }) => {
        this.estados = estados;
        this.salas = salas;
        this.artistasDisponibles = artistasPromotor; // Esta lista ya contiene objetos completos
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

        // *** LA MODIFICACIÓN CRÍTICA: Convertir strings de artistas a objetos ArtistaEvento completos ***
        if (evento.artistasAsignados && Array.isArray(evento.artistasAsignados) && evento.artistasAsignados.length > 0) {
          this.artistasAsignados = evento.artistasAsignados.map((item: string | ArtistaEvento) => {
            // Si el item ya es un objeto (por si tu backend cambia su comportamiento o si la interfaz de artista es diferente), lo usamos directamente
            if (typeof item === 'object' && item !== null && 'id' in item && 'nombreArtista' in item) {
              return item as ArtistaEvento;
            }
            // Si es un string (que es tu caso actual, ej. "Farruco")
            else if (typeof item === 'string') {
              const nombreArtistaDelBackend = item;
              const artistaCompleto = this.artistasDisponibles.find(
                a => a.nombreArtista === nombreArtistaDelBackend
              );
              if (artistaCompleto) {
                // Si lo encontramos en la lista de artistas disponibles, devolvemos el objeto completo
                return {
                  id: artistaCompleto.id,
                  nombreArtista: artistaCompleto.nombreArtista,
                  imagenPerfil: artistaCompleto.imagenPerfil
                } as ArtistaEvento;
              } else {
                // Si el artista del evento no se encuentra en la lista de disponibles,
                // loggeamos una advertencia y creamos un objeto básico para evitar errores en la UI.
                // Esto podría indicar un artista inactivo o un dato inconsistente en la DB.
                console.warn(`Artista "${nombreArtistaDelBackend}" del evento (ID: ${this.idEvento}) no encontrado en la lista de artistas disponibles.`);
                return { id: 0, nombreArtista: nombreArtistaDelBackend, imagenPerfil: 'https://via.placeholder.com/50?text=No+Img' } as ArtistaEvento;
              }
            }
            // En caso de un formato inesperado, devolvemos un objeto por defecto
            console.warn(`Formato inesperado para artista asignado: ${item}`);
            return { id: 0, nombreArtista: 'Desconocido', imagenPerfil: 'https://via.placeholder.com/50?text=Error' } as ArtistaEvento;
          });
          // Opcional: Asegúrate de que los artistas asignados se muestren ordenados
          this.artistasAsignados.sort((a, b) => a.nombreArtista.localeCompare(b.nombreArtista));
        } else {
          this.artistasAsignados = []; // Si no hay artistas o el array es vacío, inicializa vacío
        }

        // Géneros musicales: esto ya lo manejas bien, ya que el backend te los da como objetos con ID
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

    // 1. Construct the EventoActualizado object
    const eventoAEnviar: EventoActualizado = {
      // It's good practice to send the ID if your DTO has it,
      // even if the backend primarily uses the @PathVariable.
      id: this.idEvento,
      nombreEvento: this.editarEventoForm.get('nombreEvento')?.value,
      descripcion: this.editarEventoForm.get('descripcion')?.value,
      idSala: this.editarEventoForm.get('idSala')?.value,
      estado: this.editarEventoForm.get('estado')?.value,
      // If you're not using FormData for image upload, you'll send the image URL here.
      // Ensure `this.imagenPreviaUrl` holds the current (or new if set by other means) URL.
      imagenEvento: this.imagenPreviaUrl || '',
      artistasAsignados: this.artistasAsignados,
      generosMusicalesIds: this.selectedGenreIds
    };

    // 2. Remove all FormData related logic
    // Removed:
    // const formData = new FormData();
    // if (this.archivoImagen) { ... } else if (this.imagenPreviaUrl) { ... } else { ... }
    // formData.append('evento', new Blob([JSON.stringify(eventoEditado)], { type: 'application/json' }));

    // 3. Call the service method, passing the JSON object directly
    this.eventoService.actualizarEvento(this.promotorId, this.idEvento, eventoAEnviar).subscribe({
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
