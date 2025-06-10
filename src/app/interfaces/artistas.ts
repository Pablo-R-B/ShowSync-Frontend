import {GeneroMusical} from './GeneroMusical';

export interface Artistas {
  id: number;
  nombreArtista: string;
  imagenPerfil:string;
  biografia: string;
  musicUrl?:string
  generosMusicales: string[] | GeneroMusical[];
  numeroEventos?: number;

}
