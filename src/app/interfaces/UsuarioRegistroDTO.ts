export interface UsuarioRegistroDTO {
  nombreUsuario: string;
  email: string;
  contrasena: string;
  fechaNacimiento: string; // en formato 'YYYY-MM-DD'
  rol: 'ARTISTA' | 'PROMOTOR' | 'ADMINISTRADOR';
}
