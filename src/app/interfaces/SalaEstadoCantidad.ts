export interface SalaEstadoCantidad {
  salaNombre: string;
  estado: 'en_revision' | 'confirmado' | 'cancelado';
  cantidad: number;
}
