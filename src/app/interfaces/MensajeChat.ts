export interface MensajeChat {
  temporalId: string | undefined ;
  id?: number;
  contenido: string;
  remitente: string;
  tipo: 'artista' | 'promotor';
  imagenRemitenteUrl?: string;
  fechaEnvio: string;
}
