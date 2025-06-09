export interface EventoConfirmado {
  id: number;
  nombreEvento: string;
  descripcion: string;
  fechaEvento: string;  // formato ISO desde backend
  estado: string;
  imagenEvento: string;

  idSala: number | null;
  nombreSala: string | null;

  idPromotor: number | null;
  nombrePromotor: string | null;

  generosMusicales: string[];       // Array para mostrar géneros fácilmente
  artistasAsignados: string[];
}
