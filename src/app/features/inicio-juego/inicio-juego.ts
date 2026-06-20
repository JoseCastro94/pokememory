import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NIVELES, NivelJuego, obtenerNombreNivel } from '../../core/config/niveles.config';
import { JuegoService } from '../../core/services/juego.service';

@Component({
  selector: 'app-inicio-juego',
  standalone: true,
  templateUrl: './inicio-juego.html',
})
export class InicioJuegoComponent {
  private router      = inject(Router);
  private juegoService = inject(JuegoService);

  niveles           = NIVELES;
  nivelSeleccionado = signal<number>(0);

  obtenerNombreNivel(indice: number): string {
    return obtenerNombreNivel(indice);
  }

  obtenerTotalCartas(nivel: NivelJuego): number {
    return nivel.filas * nivel.columnas;
  }

  seleccionarNivel(indice: number): void {
    this.nivelSeleccionado.set(indice);
  }

  empezar(): void {
    const indice = this.nivelSeleccionado();
    this.juegoService.seleccionarNivel(this.niveles[indice], indice);
    this.router.navigate(['/juego']);
  }
}
