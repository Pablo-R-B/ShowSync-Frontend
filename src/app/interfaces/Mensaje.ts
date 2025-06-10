export interface Mensaje {
  texto: string;       // contenido del mensaje
  tipo: 'artista' | 'promotor'; // quién envía el mensaje
  hora: string;        // hora del mensaje en formato HH:mm
}
