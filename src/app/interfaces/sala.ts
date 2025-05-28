
export interface Sala{
  logo: string;
  id: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  capacidad: number;
  descripcion: string;
  imagen?: string;
  estado: 'en_revision' | 'confirmada' | 'rechazada';
}
