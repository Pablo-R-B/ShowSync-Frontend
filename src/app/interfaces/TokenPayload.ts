export interface TokenPayload {
  sub: string; // ID del usuario
  rol: 'ADMINISTRADOR' | 'ARTISTA' | 'PROMOTOR'; // Rol del usuario
  exp: number; // Fecha de expiración del token (timestamp)
}
