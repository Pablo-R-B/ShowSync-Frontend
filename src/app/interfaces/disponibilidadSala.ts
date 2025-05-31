export interface DisponibilidadSala {
  fecha: string;                // '2025-05-20'
  disponibilidad: boolean;
  salaId: number;
  eventoId?: number | null;
  estadoEvento?: string | null; // Ejemplo: 'EN_REVISION', 'CONFIRMADO'
}
