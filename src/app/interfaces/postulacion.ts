export interface Postulacion {
  eventoId: number;
  id: number;
  artistaId: number;
  artistaNombre?: string;
  promotorNombre?:string
  artistaImagen: string;
  eventoNombre: string;
  eventoImagen: string;
  eventoFecha: string;
  salaNombre: string;
  tipoSolicitud: 'postulacion' | 'oferta';
  estado: 'pendiente' | 'aceptado' | 'rechazado';
  fechaPostulacion: string;
  fechaRespuesta: Date | null;
}
