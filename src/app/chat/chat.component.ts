import {Component, inject} from '@angular/core';
import {Client, IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../servicios/auth.service';
import {PromotoresService} from '../servicios/promotores.service';
import {ArtistasService} from '../servicios/artistas.service';

@Component({
  selector: 'app-websocket',
  standalone: true,
  imports: [NgForOf, FormsModule, NgIf, NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  private stompClient: Client | null = null;
  public mensajes: { texto: string, tipo: 'artista' | 'promotor', hora: string, nombre: string }[] = [];
  public mensajeInput: string = '';
  public conectado: boolean = false;

  public tipoUsuario: 'promotor' | 'artista' = 'promotor';
  public nombreUsuario: string = 'Usuario';

  private authService = inject(AuthService);
  private promotoresService = inject(PromotoresService);
  private artistasService = inject(ArtistasService);

  ngOnInit(): void {
    this.obtenerUsuarioYConectar();
  }

  ngOnDestroy(): void {
    this.desconectar();
  }

  private obtenerUsuarioYConectar(): void {
    const userId = this.authService.userId;
    const rol = this.authService.userRole;

    if (rol === 'PROMOTOR') {
      this.tipoUsuario = 'promotor';
      this.promotoresService.getPromotorPorIdUsuario(userId).subscribe({
        next: (promotor) => {
          this.nombreUsuario = promotor.nombrePromotor;
          this.conectar();
        },
        error: (err) => console.error('Error al obtener promotor', err)
      });
    } else if (rol === 'ARTISTA') {
      this.tipoUsuario = 'artista';
      this.artistasService.artistaPorId(userId).subscribe({
        next: (artista) => {
          this.nombreUsuario = artista.nombreArtista;
          this.conectar();
        },
        error: (err) => console.error('Error al obtener artista', err)
      });
    }
  }

  conectar(): void {
    const socket = new SockJS('http://localhost:8081/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: (frame) => {
        this.conectado = true;
        console.log('✅ Conectado:', frame);

        this.stompClient?.subscribe('/tema/actualizacion', (mensaje: IMessage) => {
          const recibido = JSON.parse(mensaje.body);
          this.mensajes.push({
            texto: recibido.texto,
            tipo: recibido.tipo,
            nombre: recibido.nombre || 'Desconocido',
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        });
      },
      onStompError: (frame) => {
        console.error('❌ Error STOMP', frame);
      }
    });

    this.stompClient.activate();
  }

  enviarMensaje(): void {
    if (this.stompClient && this.stompClient.connected && this.mensajeInput.trim() !== '') {
      const nuevoMensaje = {
        texto: this.mensajeInput.trim(),
        tipo: this.tipoUsuario,
        nombre: this.nombreUsuario
      };

      this.stompClient.publish({
        destination: '/app/enviar',
        body: JSON.stringify(nuevoMensaje)
      });

      this.mensajes.push({
        texto: nuevoMensaje.texto,
        tipo: nuevoMensaje.tipo,
        nombre: nuevoMensaje.nombre,
        hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      this.mensajeInput = '';
    }
  }

  desconectar(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate().then(() => {
        console.log('🔌 Desconectado');
        this.conectado = false;
      });
    }
  }
}
