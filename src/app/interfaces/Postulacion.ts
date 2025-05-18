export interface Postulacion{
  eventoId: number;
  id: number;
  artistaId: number;
  artistaNombre: string;
  artistaImagen: string;
  eventoNombre: string;
  eventoImagen: string;
  eventoFecha: string;
  eventoSalaNombre: string;
  estado: 'pendiente' | 'aceptado' | 'rechazado';
  fechaPostulacion: Date;
  fechaRespuesta: Date | null;
}
