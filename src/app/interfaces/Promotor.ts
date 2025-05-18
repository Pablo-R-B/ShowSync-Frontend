import {EventoDTO} from './EventoDTO';

export interface Promotor {
  id: number;
  nombrePromotor: string;
  descripcion: string;
  imagenPerfil: string;
  eventos?:EventoDTO[];
}
