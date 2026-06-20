import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { JuegoService } from '../../core/services/juego.service';
import { CartaMemory } from '../../core/model/carta-memory.model';
import { CartaMemoryComponent } from '../carta-memory/carta-memory';
import { HeaderJuegoComponent } from '../header-juego/header-juego';

@Component({
  selector: 'app-tablero-juego',
  standalone: true,
  imports: [CartaMemoryComponent, HeaderJuegoComponent],
  templateUrl: './tablero-juego.html',
  styleUrl: './tablero-juego.css',
})
export class TableroJuegoComponent implements OnInit {
  private router = inject(Router);
  protected juegoService = inject(JuegoService);
  private viewport = signal(this.obtenerViewport());

  cartas = this.juegoService.cartas;
  cargando = this.juegoService.cargando;
  juegoTerminado = this.juegoService.juegoTerminado;
  juegoGanado = this.juegoService.juegoGanado;
  movimientos = this.juegoService.movimientos;
  puntos = this.juegoService.puntos;
  tiempoRestante = this.juegoService.tiempoRestante;

  private layoutTablero = computed(() => {
    const nivel = this.juegoService.nivelActual();
    const totalCartas = nivel ? nivel.filas * nivel.columnas : 12;
    const { width, height } = this.viewport();

    const anchoDisponible = Math.max(280, width - (width < 640 ? 24 : 48));
    const altoDisponible = Math.max(300, height - (width < 640 ? 116 : 104));
    const gap = width < 640 ? 6 : 8;
    const altoRatio = 1.4545;
    const anchoMaximo = width < 640 ? 88 : 110;
    const anchoMinimo = width < 380 ? 44 : width < 640 ? 52 : 68;
    const columnasMaximas = this.obtenerColumnasMaximas(width, totalCartas);

    let mejor = {
      columnas: Math.min(columnasMaximas, totalCartas),
      filas: Math.ceil(totalCartas / Math.min(columnasMaximas, totalCartas)),
      anchoCarta: anchoMinimo,
    };

    for (let columnas = 2; columnas <= columnasMaximas; columnas++) {
      const filas = Math.ceil(totalCartas / columnas);
      const anchoPorEspacio = (anchoDisponible - gap * (columnas - 1)) / columnas;
      const anchoPorAlto = (altoDisponible - gap * (filas - 1)) / filas / altoRatio;
      const anchoCarta = Math.floor(Math.min(anchoMaximo, anchoPorEspacio, anchoPorAlto));

      if (
        anchoCarta >= anchoMinimo &&
        (anchoCarta > mejor.anchoCarta || (anchoCarta === mejor.anchoCarta && filas < mejor.filas))
      ) {
        mejor = { columnas, filas, anchoCarta };
      }
    }

    return mejor;
  });

  columnas = computed(() => this.layoutTablero().columnas);
  filas = computed(() => this.layoutTablero().filas);

  gridStyle = computed(() => ({
    'grid-template-columns': `repeat(${this.columnas()}, var(--card-width))`,
    '--card-width': `${this.layoutTablero().anchoCarta}px`,
    '--filas': `${this.filas()}`,
  }));

  ngOnInit(): void {
    if (!this.juegoService.nivelActual()) {
      this.router.navigate(['/']);
      return;
    }
    this.juegoService.iniciarJuego();
  }

  seleccionarCarta(carta: CartaMemory): void {
    this.juegoService.seleccionarCarta(carta);
  }

  volverAlInicio(): void {
    this.router.navigate(['/']);
  }

  reiniciarNivel(): void {
    this.juegoService.iniciarJuego();
  }

  @HostListener('window:resize')
  actualizarViewport(): void {
    this.viewport.set(this.obtenerViewport());
  }

  private obtenerViewport(): { width: number; height: number } {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }

    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  private obtenerColumnasMaximas(width: number, totalCartas: number): number {
    if (width >= 1280) return Math.min(totalCartas, 10);
    if (width >= 1024) return Math.min(totalCartas, 9);
    if (width >= 768) return Math.min(totalCartas, 7);
    if (width >= 520) return Math.min(totalCartas, 5);
    return Math.min(totalCartas, 4);
  }
}
