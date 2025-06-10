import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Mensaje } from '../interfaces/Mensaje';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private stompClient: Client | undefined;
  private socketUrl = 'http://localhost:8081/ws';

  public conectado = false;
  public mensajes: Mensaje[] = [];

  conectar(): void {
    const socket = new SockJS(this.socketUrl);
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      onConnect: () => {
        this.conectado = true;
        // @ts-ignore
        this.stompClient.subscribe('/tema/actualizacion', (message: IMessage) => {
          const body = JSON.parse(message.body) as Mensaje;
          this.mensajes.push(body);
          console.log('Mensaje recibido', body);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });
    this.stompClient.activate();
  }

  enviarMensaje(mensaje: Mensaje): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/enviar',
        body: JSON.stringify(mensaje)
      });
    }
  }

  desconectar(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.conectado = false;
    }
  }
}
