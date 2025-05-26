export interface Usuario {
  id: number;
  nombreUsuario: string;
  email: string;
  rol: string; // Puedes usar un enum si los roles están definidos
  verificado: boolean;
  fechaNacimiento: string; // Formato: "yyyy-MM-dd"
  fechaRegistro: string; // Formato: "yyyy-MM-dd'T'HH:mm:ss"
}
