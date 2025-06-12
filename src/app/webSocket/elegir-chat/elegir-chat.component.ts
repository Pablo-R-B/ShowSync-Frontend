import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from '../../servicios/auth.service';
import {ArtistasService} from '../../servicios/artistas.service';
import {PromotoresService} from '../../servicios/promotores.service';
import {Router, RouterLink} from '@angular/router';
import {Promotor} from '../../interfaces/Promotor';
import {Artistas} from '../../interfaces/artistas';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-elegir-chat',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    NgForOf
  ],
  templateUrl: './elegir-chat.component.html',
  styleUrl: './elegir-chat.component.css'
})
export class ElegirChatComponent implements OnInit {
  private authService = inject(AuthService);
  private artistasService = inject(ArtistasService);
  private promotoresService = inject(PromotoresService);
  private router = inject(Router);

  currentUserRole: 'artista' | 'promotor' | null = null;
  currentProfileId: number | null = null; // ID del artista o promotor logueado (tu propio ID de perfil)
  chatPartners: (Artistas | Promotor)[] = []; // Lista de artistas o promotores con los que se puede chatear
  loading: boolean = true;
  error: string | null = null;

  ngOnInit(): void {
    // Obtener el rol del usuario actual desde AuthService
    this.currentUserRole = this.authService.userRole?.toLowerCase() as 'artista' | 'promotor' || null;
    const userId = this.authService.userId; // ID del usuario en la tabla 'usuarios'

    if (!this.currentUserRole || !userId) {
      this.error = 'Debes iniciar sesión para acceder al chat.';
      this.loading = false;
      this.router.navigate(['/login']); // Redirigir si no hay usuario logueado
      return;
    }

    // Obtener el ID del perfil (artista.id o promotor.id) del usuario logueado
    if (this.currentUserRole === 'artista') {
      this.artistasService.getArtistaIdPorUsuario(userId).subscribe({
        next: (artistId) => {
          this.currentProfileId = artistId;
          this.loadPromoters(); // Cargar promotores si el usuario es artista
        },
        error: (err) => {
          this.error = 'No se pudo obtener el ID de tu perfil de artista. Revisa la consola para más detalles.';
          this.loading = false;
          console.error('Error al obtener ID de artista por usuario:', err);
        }
      });
    } else if (this.currentUserRole === 'promotor') {
      this.promotoresService.getPromotorPorIdUsuario(userId).subscribe({
        next: (promotor) => {
          this.currentProfileId = promotor.id;
          this.loadArtists(); // Cargar artistas si el usuario es promotor
        },
        error: (err) => {
          this.error = 'No se pudo obtener el ID de tu perfil de promotor. Revisa la consola para más detalles.';
          this.loading = false;
          console.error('Error al obtener promotor por usuario:', err);
        }
      });
    } else {
      this.error = 'Rol de usuario no soportado para el chat.';
      this.loading = false;
    }
  }

  // Carga la lista de promotores (asumiendo que listarPromotores devuelve Promotor[])
  loadPromoters(): void {
    this.promotoresService.listarPromotores().subscribe({
      next: (promotores: Promotor[]) => {
        this.chatPartners = promotores;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la lista de promotores. Revisa la consola para más detalles.';
        this.loading = false;
        console.error('Error al cargar promotores:', err);
      }
    });
  }

  // Carga la lista de artistas usando el método getArtistas() sin paginación
  loadArtists(): void {
    this.artistasService.getArtistas().subscribe({ // Llama al nuevo método getArtistas()
      next: (artistas: Artistas[]) => { // Espera un array directamente (Artistas[])
        this.chatPartners = artistas;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar la lista de artistas. Revisa la consola para más detalles.';
        this.loading = false;
        console.error('Error al cargar artistas:', err);
      }
    });
  }

  // Genera la ruta al ChatComponent con los IDs correctos
  getChatRoute(partner: any): any[] {
    if (this.currentUserRole === 'artista' && this.currentProfileId !== null) {
      // Si eres artista, el partner es un promotor. La ruta es /chat/:artistaId/:promotorId
      return ['/chat', this.currentProfileId, partner.id];
    } else if (this.currentUserRole === 'promotor' && this.currentProfileId !== null) {
      // Si eres promotor, el partner es un artista. La ruta es /chat/:artistaId/:promotorId
      return ['/chat', partner.id, this.currentProfileId];
    }
    return ['/elegir-chat']; // Fallback si algo sale mal
  }

  // Métodos auxiliares para mostrar información en el HTML
  getPartnerName(partner: any): string {
    return this.currentUserRole === 'artista' ? partner.nombrePromotor : partner.nombreArtista;
  }

  getPartnerImage(partner: any): string {
    return this.currentUserRole === 'artista' ? (partner.imagenPerfil || 'https://placehold.co/50x50/cccccc/ffffff?text=P') : (partner.imagenPerfil || 'https://placehold.co/50x50/cccccc/ffffff?text=A');
  }
}
