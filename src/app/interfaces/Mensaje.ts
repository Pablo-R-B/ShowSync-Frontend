export interface Mensaje {
  texto: string;        // Corresponde a 'contenido' del backend
  tipo: 'artista' | 'promotor' | 'bot'; // Añadido 'bot' para mensajes del backend
  hora: string;         // Hora del mensaje
  nombre: string;       // Corresponde a 'remitente' del backend
  imagen: string;       // Corresponde a 'imagenRemitenteUrl' del backend
}
