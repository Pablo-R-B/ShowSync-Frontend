import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {CommonModule, NgForOf, NgIf, NgSwitch} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { PromotoresService } from '../../servicios/promotores.service';
import { ArtistasService } from '../../servicios/artistas.service';
import { MensajeChat } from '../../interfaces/MensajeChat'; // Importamos MensajeChat
import { ConversacionesService } from '../../servicios/ConversacionesService';

@Component({
  selector: 'app-websocket',
  standalone: true,
  imports: [NgForOf, FormsModule, CommonModule, NgIf,  NgSwitch],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  private stompClient: Client | null = null;
  // ¡CRÍTICO! Ajuste del tipo: 'id' puede ser number o string, 'temporalId' opcional, 'tipo' es string
  public mensajes: { id?: number | string; temporalId?: string; texto: string; tipo: string; hora: string; nombre: string; imagen: string; }[] = [];
  public mensajeInput: string = '';
  public conectado: boolean = false;
  public mostrarModalAlerta: boolean = false;
  public mensajeModal: string = '';

  public tipoUsuario: 'promotor' | 'artista' = 'promotor';
  public nombreUsuario: string = 'Usuario';
  public imagenUsuario: string = '';

  public chatId: number | null = null;

  targetArtistaId: number | null = null;
  targetPromotorId: number | null = null;

  private authService = inject(AuthService);
  private promotoresService = inject(PromotoresService);
  private artistasService = inject(ArtistasService);
  private conversacionesService = inject(ConversacionesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  private routeto = inject(Router);


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const artistaIdParam = params.get('artistaId');
      const promotorIdParam = params.get('promotorId');

      this.targetArtistaId = artistaIdParam ? +artistaIdParam : null;
      this.targetPromotorId = promotorIdParam ? +promotorIdParam : null;

      if (this.targetArtistaId !== null && this.targetPromotorId !== null) {
        this.obtenerUsuarioLogueado();
      } else {
        console.error('ChatComponent: IDs de artista y/o promotor no proporcionados en la URL.');
        this.conectado = false;
        this.mostrarAlerta('No se puede iniciar el chat. IDs de conversación incompletos en la URL.');
        this.router.navigate(['/elegir-chat']);
      }
    });
  }

  ngOnDestroy(): void {
    this.desconectar();
  }

  private obtenerUsuarioLogueado(): void {
    const userId = this.authService.userId;
    const rol = this.authService.userRole;

    if (!userId || !rol) {
      console.error('Usuario no autenticado o rol no definido.');
      this.conectado = false;
      this.mostrarAlerta('Por favor, inicia sesión para usar el chat.');
      this.router.navigate(['/login']);
      return;
    }

    const rolLowerCase = rol.toLowerCase() as 'promotor' | 'artista';
    this.tipoUsuario = rolLowerCase;

    if (rol === 'PROMOTOR') {
      this.promotoresService.getPromotorPorIdUsuario(userId).subscribe({
        next: (promotor) => {
          this.nombreUsuario = promotor.nombrePromotor;
          this.imagenUsuario = promotor.imagenPerfil || 'https://placehold.co/50x50/cccccc/ffffff?text=P';
          this.iniciarConversacion(promotor.id);
        },
        error: (err) => {
          console.error('Error al obtener promotor desde la BB.DD.:', err);
          this.mostrarAlerta('Error al cargar tu perfil de promotor. Intenta de nuevo más tarde.');
        }
      });
    } else if (rol === 'ARTISTA') {
      this.artistasService.getArtistaIdPorUsuario(userId).subscribe({
        next: (artistId) => {
          this.artistasService.artistaPorId(artistId).subscribe({
            next: (artista) => {
              this.nombreUsuario = artista.nombreArtista;
              this.imagenUsuario = artista.imagenPerfil || 'https://placehold.co/50x50/cccccc/ffffff?text=A';
              this.iniciarConversacion(artista.id);
            },
            error: (err) => {
              console.error('Error al obtener detalles del artista desde la BB.DD.:', err);
              this.mostrarAlerta('Error al cargar tu perfil de artista. Intenta de nuevo más tarde.');
            }
          });
        },
        error: (err) => {
          console.error('Error al obtener ID del artista por usuario desde la BB.DD.:', err);
          this.mostrarAlerta('Error al identificar tu perfil de artista. Intenta de nuevo más tarde.');
        }
      });
    } else {
      console.warn('Rol de usuario no reconocido:', rol);
      this.conectado = false;
      this.mostrarAlerta('Tu rol de usuario no está permitido para el chat.');
    }
  }

  private iniciarConversacion(currentProfileId: number): void {
    if (this.targetArtistaId === null || this.targetPromotorId === null) {
      console.error('ChatComponent: IDs de artista y/o promotor no definidos.');
      this.mostrarAlerta('Error interno al iniciar la conversación. Por favor, reinicia la página.');
      return;
    }

    this.conversacionesService.getOrCreateConversation(this.targetArtistaId, this.targetPromotorId).subscribe({
      next: (chatId) => {
        this.chatId = chatId;
        console.log('Conversación iniciada con chatId:', this.chatId);
        this.cargarHistorialMensajes();
        this.conectarWebSocket();
      },
      error: (err) => {
        console.error('Error al obtener o crear conversación:', err);
        this.mostrarAlerta('No se pudo establecer la conversación. Revisa tu conexión.');
        this.conectado = false;
      }
    });
  }

  private cargarHistorialMensajes(): void {
    if (this.chatId === null) {
      console.error('No se puede cargar el historial: chatId es null.');
      return;
    }
    this.conversacionesService.getConversationMessages(this.chatId).subscribe({
      next: (mensajesHistorial: MensajeChat[]) => {
        this.mensajes = mensajesHistorial.map(msg => ({
          id: msg.id,
          temporalId: msg.temporalId, // Aseguramos que temporalId también se mapea del historial
          texto: msg.contenido,
          tipo: msg.tipo,
          nombre: msg.remitente,
          imagen: msg.imagenRemitenteUrl || 'https://placehold.co/50x50/cccccc/ffffff?text=?',
          hora: (msg.fechaEnvio && !isNaN(new Date(msg.fechaEnvio).getTime())) ?
            new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
            'Hora no disponible'
        }));
        this.scrollToBottom();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historial de mensajes:', err);
        this.mostrarAlerta('Error al cargar el historial de mensajes. Podría no mostrar mensajes antiguos.');
      }
    });
  }

  conectarWebSocket(): void {
    if (this.chatId === null) {
      console.error('No se puede conectar WebSocket: chatId es null.');
      this.mostrarAlerta('No se pudo establecer la conexión de chat. Falta ID de conversación.');
      return;
    }
    const socket = new SockJS('http://localhost:8081/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: (frame) => {
        this.conectado = true;
        console.log('✅ Conectado:', frame);
        console.log(`DEBUG: Cliente intentando suscribirse a: /tema/chat/${this.chatId}/mensajes`);

        this.stompClient?.subscribe('/tema/chat/' + this.chatId + '/mensajes', (mensaje: IMessage) => {
          const recibido: MensajeChat = JSON.parse(mensaje.body);
          console.log('Mensaje recibido por WebSocket:', recibido);

          const horaMensaje = (recibido.fechaEnvio && !isNaN(new Date(recibido.fechaEnvio).getTime())) ?
            new Date(recibido.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
            'Hora no disponible';

          // ¡CRÍTICO! Buscar el mensaje localmente por su temporalId si lo tiene, para actualizarlo
          let existingMessageIndex = -1;
          if (recibido.temporalId) { // Solo si el mensaje recibido tiene un temporalId (es decir, viene de nuestro propio envío)
            existingMessageIndex = this.mensajes.findIndex(m => m.temporalId === recibido.temporalId);
          } else if (recibido.id) { // Si no tiene temporalId, buscamos por el ID real (mensajes de otros o del historial)
            existingMessageIndex = this.mensajes.findIndex(m => m.id === recibido.id);
          }

          if (existingMessageIndex > -1) {
            // Si el mensaje ya existe (lo añadimos localmente con temporalId), lo actualizamos
            // Creamos un nuevo objeto para asegurar que Angular detecte el cambio de referencia
            this.mensajes[existingMessageIndex] = {
              ...this.mensajes[existingMessageIndex], // Mantiene las propiedades existentes
              id: recibido.id, // ¡Actualiza al ID real del servidor!
              temporalId: undefined, // Limpiamos el temporalId una vez que tenemos el ID real
              texto: recibido.contenido,
              tipo: recibido.tipo.toLowerCase(),
              nombre: recibido.remitente,
              imagen: recibido.imagenRemitenteUrl || 'https://placehold.co/50x50/cccccc/ffffff?text=?',
              hora: horaMensaje // Usa la hora formateada correctamente del servidor
            };
            console.log(`DEBUG: Mensaje con temporalId ${recibido.temporalId} actualizado a ID real ${recibido.id}.`);
          } else {
            // Si el mensaje no se encontró como duplicado, significa que es un mensaje nuevo (de otro usuario)
            // o un mensaje propio que por alguna razón no fue añadido localmente (menos común).
            this.mensajes = [...this.mensajes, {
              id: recibido.id,
              temporalId: recibido.temporalId, // Guardamos temporalId si viene del servidor
              texto: recibido.contenido,
              tipo: recibido.tipo.toLowerCase(),
              nombre: recibido.remitente,
              imagen: recibido.imagenRemitenteUrl || 'https://placehold.co/50x50/cccccc/ffffff?text=?',
              hora: horaMensaje
            }];
            console.log(`DEBUG: Mensaje con ID ${recibido.id} (o temporal ${recibido.temporalId}) añadido como nuevo.`);
          }

          this.scrollToBottom();
          this.cd.detectChanges(); // Forzar detección de cambios después de añadir o actualizar

          // Muestra alerta si el mensaje no es del usuario actual
          if (recibido.remitente !== this.nombreUsuario) {
            this.mostrarAlerta(`¡Nuevo mensaje de ${recibido.remitente}!`);
          }
        });
      },
      onStompError: (frame) => {
        console.error('❌ Error STOMP', frame);
        this.conectado = false;
        this.mostrarAlerta('Error en la conexión de chat. Check your internet connection.');
      },
      onDisconnect: (frame) => {
        console.log('🔌 Desconectado:', frame);
        this.conectado = false;
      }
    });

    this.stompClient.activate();
  }

  /**
   * Genera un ID temporal único para el mensaje del cliente.
   */
  private generateTempId(): string {
    // Un ID más robusto, combinando timestamp con un número aleatorio y base 36
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Sends a message to the WebSocket server for the specific conversation.
   * Also adds the message to the local display immediately for better UX.
   */
  enviarMensaje(): void {
    if (this.stompClient && this.stompClient.connected && this.mensajeInput.trim() !== '' && this.chatId !== null) {
      const now = new Date();
      const tempId = this.generateTempId(); // Genera un ID temporal único
      const horaLocal = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Mensaje que se enviará al backend (¡CRÍTICO! Incluye temporalId)
      const mensajeParaBackend: MensajeChat = {
        contenido: this.mensajeInput.trim(),
        tipo: this.tipoUsuario,
        remitente: this.nombreUsuario,
        imagenRemitenteUrl: this.imagenUsuario,
        fechaEnvio: now.toISOString(),
        temporalId: tempId // ¡CRÍTICO! Enviamos el ID temporal al backend
      };

      // Añade el mensaje localmente con el ID temporal para que se vea al instante
      this.mensajes = [...this.mensajes, {
        id: undefined, // El ID real vendrá del backend después
        temporalId: tempId, // Usamos este ID temporal para referenciarlo localmente
        texto: mensajeParaBackend.contenido,
        tipo: mensajeParaBackend.tipo,
        nombre: mensajeParaBackend.remitente,
        imagen: mensajeParaBackend.imagenRemitenteUrl || 'https://placehold.co/50x50/cccccc/ffffff?text=?',
        hora: horaLocal
      }];

      this.stompClient.publish({
        destination: '/app/chat/' + this.chatId + '/enviar',
        body: JSON.stringify(mensajeParaBackend)
      });

      this.mensajeInput = '';
      this.scrollToBottom();
      this.cd.detectChanges();

    } else {
      let warningMessage = 'No se puede enviar el mensaje: ';
      if (!this.stompClient || !this.stompClient.connected) {
        warningMessage += 'WebSocket no conectado. ';
      }
      if (this.mensajeInput.trim() === '') {
        warningMessage += 'El mensaje está vacío. ';
      }
      if (this.chatId === null) {
        warningMessage += 'ChatId es null. ';
      }
      console.warn(warningMessage);
      this.mostrarAlerta('No se pudo enviar el mensaje. Asegúrate de estar conectado y de que el chat esté listo.');
    }
  }

  /**
   * Disconnects from the WebSocket server.
   */
  desconectar(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate().then(() => {
        console.log('🔌 Desconectado');
        this.conectado = false;
      });
    }
  }

  /**
   * Scrolls the chat area to the bottom to show the latest messages.
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      const journalScroll = document.getElementById('journal-scroll');
      if (journalScroll) {
        journalScroll.scrollTop = journalScroll.scrollHeight;
      }
    }, 0);
  }

  /**
   * Displays a custom alert modal.
   * @param mensaje The message to display.
   */
  mostrarAlerta(mensaje: string): void {
    this.mensajeModal = mensaje;
    this.mostrarModalAlerta = true;
  }

  /**
   * Closes the alert modal.
   */
  cerrarAlerta(): void {
    this.mostrarModalAlerta = false;
    this.mensajeModal = '';
  }

  // Método trackBy para optimizar el renderizado de *ngFor
  trackByMensajeId(index: number, mensaje: any): number | string | undefined {
    return mensaje.id || mensaje.temporalId || index;
  }

  volver(): void {
    window.history.back();
  }
}
