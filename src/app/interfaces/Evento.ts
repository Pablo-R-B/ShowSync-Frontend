
export interface Evento {
  texto: string;
  idSala: string;
  nombre: string;
  artistasAsignados: string;
  generosMusicales: string;
  nombrePromotor: string;
  estado: string;
  nombreSala: string;
  genero: string;
  ubicacion: string;
  sala_id: string;
  id: number;
  nombreEvento: string;
  descripcion: string;
  fechaEvento: string;
  imagenEvento: string;
  salaNombre: string;
  seguido?: boolean; // opcional si luego lo usas
  estadoPostulacion: string;
}
