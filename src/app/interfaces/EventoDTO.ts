export interface EventoDTO {
  id: number;
  nombreEvento: string;
  descripcion: string;
  fechaEvento: string;  // Este campo vendrá en formato ISO desde el backend
  estado: string;
  imagenEvento: string;
  idSala: number;
  nombreSala: string;
  idPromotor: number;
  nombrePromotor: string;
}
