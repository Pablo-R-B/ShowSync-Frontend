export interface TokenPayload {
  sub: string;
  rol: 'ADMINISTRADOR' | 'ARTISTA' | 'PROMOTOR';
  exp: number;
  nombre: string;
  id:number;
}
