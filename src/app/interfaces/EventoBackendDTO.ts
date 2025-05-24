export interface EventoBackendDTO {
  nombre_evento: string;
  descripcion: string;
  fecha_evento: string;
  sala_id: { id: number };
  estado: string;
  imagen_evento: string;
}
