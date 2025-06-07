import {ArtistaEvento} from './ArtistaEvento';
import {GeneroMusicalDTO} from './GeneroMusicalDTO';


export interface EventoActualizado {
  id?: number;
  nombreEvento: string;
  descripcion: string;
  idSala: number;
  estado: string;
  imagenEvento: string;
  fechaEvento?: string;
  nombreSala?: string;
  idPromotor?: number;
  nombrePromotor?: string;

  artistasAsignados?: ArtistaEvento[];
  generosMusicales?: GeneroMusicalDTO[];
  generosMusicalesIds?: number[];
}
