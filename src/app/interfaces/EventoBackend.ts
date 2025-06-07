export interface EventoBackend {
  nombre_evento: string;
  descripcion: string;
  sala: { id: number };
  estado: string;
  imagen_evento: string;
  genero?: {
    id: number;
    nombre?: string;
  };
}
