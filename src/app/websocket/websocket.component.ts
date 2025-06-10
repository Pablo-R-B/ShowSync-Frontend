import { Component, OnInit, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {NgForOf, AsyncPipe, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-websocket',
  standalone: true,
  imports: [NgForOf, FormsModule, NgIf],
  templateUrl: './websocket.component.html',
  styleUrls: ['./websocket.component.css']
})
export class WebsocketComponent implements OnInit, OnDestroy {
  private client?: Client;
  mensajes: string[] = [];
  mensajeInput: string = '';
  conectado: boolean = false;

  ngOnInit() {
    this.conectar();
  }

  conectar() {
    const socket = new SockJS('http://localhost:8081/ws');
    this.client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      debug: (str) => console.log(str)
    });

    this.client.onConnect = () => {
      this.conectado = true;

      this.client?.subscribe('/tema/actualizacion', (message: IMessage) => {
        try {
          const cuerpo = JSON.parse(message.body);
          this.mensajes.push(cuerpo.mensaje || JSON.stringify(cuerpo));
        } catch (e) {
          this.mensajes.push(message.body); // fallback si no es JSON válido
        }
      });
    };

    this.client.onDisconnect = () => {
      this.conectado = false;
    };

    this.client.activate();
  }

  enviarMensaje() {
    if (this.client && this.client.connected) {
      const mensajeObj = { mensaje: this.mensajeInput };
      this.client.publish({
        destination: '/app/enviar', // <-- Cambia según tu backend
        body: JSON.stringify(mensajeObj)
      });
      this.mensajeInput = '';
    }
  }

  ngOnDestroy() {
    this.client?.deactivate();
  }
}
