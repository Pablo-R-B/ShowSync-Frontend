
export interface Sala{
  logo: string;
  id: number;
  nombre: string;
  direccion: string;
  capacidad: number;
  imagen?: string;
  estado: 'en_revision' | 'confirmada' | 'rechazada';
}
