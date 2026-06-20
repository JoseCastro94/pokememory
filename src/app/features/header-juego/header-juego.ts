import { Component, computed, inject } from '@angular/core';
import { JuegoService } from '../../core/services/juego.service';
import { obtenerNombreNivel } from '../../core/config/niveles.config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-juego',
  standalone: true,
  templateUrl: './header-juego.html',
  styleUrl: './header-juego.css',
})
export class HeaderJuegoComponent {
  private juegoService = inject(JuegoService);
  private router = inject(Router);
  tiempoRestante = this.juegoService.tiempoRestante;
  movimientos = this.juegoService.movimientos;
  puntos = this.juegoService.puntos;
  indiceNivel = this.juegoService.indiceNivel;

  nombreNivel = computed(() =>
    obtenerNombreNivel(this.juegoService.indiceNivel())
  );

  numeroNivel = computed(() => this.juegoService.indiceNivel() + 1);

  tiempoFormateado = computed(() => {
    const t = this.tiempoRestante();
    const min = Math.floor(t / 60).toString().padStart(2, '0');
    const seg = (t % 60).toString().padStart(2, '0');
    return `${min}:${seg}`;
  });

  tiempoCritico = computed(() => this.tiempoRestante() <= 10);

  reiniciarJuego() {
    this.router.navigateByUrl('/');
  }
}


