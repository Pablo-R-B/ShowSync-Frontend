import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SalasService } from '../../../servicios/salas.service';
import { FormsModule } from '@angular/forms';
import {FileUpload} from 'primeng/fileupload';

@Component({
  selector: 'app-formulario-sala',
  templateUrl: './formulario-sala.component.html',
  standalone: true,
  imports: [
    FormsModule,
    FileUpload
  ]
})
export class FormularioSalaComponent implements OnInit {
  sala: any = {
    nombre: '',
    capacidad: null,
    descripcion: ''
    // Agrega aquí más campos si tu DTO tiene más
  };

  editando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salaService: SalasService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editando = true;
      this.salaService.obtenerPorId(+id).subscribe({
        next: (data) => this.sala = data,
        error: (err) => console.error('Error al obtener sala:', err)
      });
    }
  }

  guardarSala(): void {
    if (this.editando) {
      this.salaService.editar(this.sala.id, this.sala).subscribe({
        next: () => this.router.navigate(['/admin/salas']),
        error: (err) => console.error('Error al actualizar sala:', err)
      });
    } else {
      this.salaService.crear(this.sala).subscribe({
        next: () => this.router.navigate(['/admin/salas']),
        error: (err) => console.error('Error al crear sala:', err)
      });
    }
  }

  subirImagen(event: any) {
    const archivo: File = event.files[0];

    const lector = new FileReader();
    lector.onload = () => {
      const base64 = lector.result as string;
      this.sala.imagen = base64; // Guarda la imagen en base64 para enviarla al backend
    };
    lector.readAsDataURL(archivo);
  }


  cancelar(): void {
    this.router.navigate(['/admin/salas']);
  }
}
