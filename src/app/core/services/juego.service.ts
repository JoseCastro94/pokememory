import { inject, Injectable, Service, signal } from '@angular/core';
import { CartaMemory } from '../model/carta-memory.model';
import { NivelJuego } from '../config/niveles.config';
import { PokemonService } from './pokemon.service';
import { mapPokemonResponse } from '../helpers/pokemon-mapper';
import { Pokemon } from '../model/pokemon.model';

const DURACION_FLIP_MS = 450;
const TOTAL_POKEMON_DISPONIBLES = 150;

@Service()
export class JuegoService {
  private pokemonService = inject(PokemonService);

  cartas          = signal<CartaMemory[]>([]);
  nivelActual     = signal<NivelJuego | null>(null);
  indiceNivel     = signal<number>(0);
  tiempoRestante  = signal<number>(0);
  movimientos     = signal<number>(0);
  puntos          = signal<number>(0);
  juegoTerminado  = signal<boolean>(false);
  juegoGanado     = signal<boolean>(false);
  cargando        = signal<boolean>(false);

  private cartaSeleccionadaUno: CartaMemory | null = null;
  private cartaSeleccionadaDos: CartaMemory | null = null;
  private tableroBloqueado = false;
  private intervaloTemporizador: ReturnType<typeof setInterval> | null = null;

  seleccionarNivel(nivel: NivelJuego, indice: number): void {
    this.nivelActual.set(nivel);
    this.indiceNivel.set(indice);
  }

  iniciarJuego(): void {
    const nivel = this.nivelActual();
    if (!nivel) return;

    this.cargando.set(true);
    this.juegoTerminado.set(false);
    this.juegoGanado.set(false);
    this.movimientos.set(0);
    this.puntos.set(0);
    this.cartaSeleccionadaUno = null;
    this.cartaSeleccionadaDos = null;
    this.tableroBloqueado = false;
    this.detenerTemporizador();

    const totalCartas  = nivel.filas * nivel.columnas;
    const totalParejas = totalCartas / 2;

    this.pokemonService.getPokemons(TOTAL_POKEMON_DISPONIBLES, 0).subscribe({
      next: (resp) => {
        const pokemones = this.seleccionarPokemonesAleatorios(
          mapPokemonResponse(resp),
          totalParejas
        );
        this.inicializarTablero(pokemones, nivel);
        this.tiempoRestante.set(nivel.tiempoSegundos);
        this.cargando.set(false);
        this.iniciarTemporizador();
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  private inicializarTablero(pokemones: Pokemon[], nivel: NivelJuego): void {
    const pares: CartaMemory[] = [];

    pokemones.forEach((poke) => {
      pares.push(this.crearCarta(poke, 'a'));
      pares.push(this.crearCarta(poke, 'b'));
    });

    const totalCartas = nivel.filas * nivel.columnas;
    const mezcladas = this.mezclarCartas(pares).slice(0, totalCartas);
    this.cartas.set(mezcladas);
  }

  private crearCarta(poke: Pokemon, sufijo: string): CartaMemory {
    return {
      instanceId: `${poke.id}-${sufijo}-${Math.random()}`,
      pokemonId:  poke.id,
      nombre:     poke.name,
      imagenUrl:  poke.imageUrl,
      volteada:   false,
      encontrada: false,
    };
  }

  seleccionarCarta(carta: CartaMemory): void {
    if (
      this.tableroBloqueado ||
      carta.volteada       ||
      carta.encontrada     ||
      this.juegoTerminado()
    ) return;

    this.actualizarCarta(carta.instanceId, { volteada: true });

    if (!this.cartaSeleccionadaUno) {
      this.cartaSeleccionadaUno = carta;
      return;
    }

    // Segunda carta → bloquear tablero y evaluar
    this.cartaSeleccionadaDos = carta;
    this.movimientos.update((m) => m + 1);
    this.tableroBloqueado = true;

    this.verificarPareja();
  }

  private verificarPareja(): void {
    const una = this.cartaSeleccionadaUno!;
    const dos = this.cartaSeleccionadaDos!;

    if (una.pokemonId === dos.pokemonId) {
      setTimeout(() => {
        this.reproducirSonido('correcto');
        this.actualizarCarta(una.instanceId, { encontrada: true });
        this.actualizarCarta(dos.instanceId, { encontrada: true });
        this.puntos.update((p) => p + this.calcularPuntos());
        this.reiniciarTurno();

        setTimeout(() => {
          this.verificarVictoria();
        }, 600);
      }, DURACION_FLIP_MS);

    } else {
      this.reproducirSonido('incorrecto');
      setTimeout(() => {
        this.actualizarCarta(una.instanceId, { volteada: false });
        this.actualizarCarta(dos.instanceId, { volteada: false });
        this.reiniciarTurno();
      }, 1200);
    }
  }

  private reiniciarTurno(): void {
    this.cartaSeleccionadaUno = null;
    this.cartaSeleccionadaDos = null;
    this.tableroBloqueado = false;
  }

  private verificarVictoria(): void {
    if (this.cartas().every((c) => c.encontrada)) {
      this.detenerTemporizador();
      this.juegoGanado.set(true);
      this.juegoTerminado.set(true);
    }
  }

  private iniciarTemporizador(): void {
    this.detenerTemporizador();
    this.intervaloTemporizador = setInterval(() => {
      const tiempo = this.tiempoRestante();
      if (tiempo <= 1) {
        this.tiempoRestante.set(0);
        this.terminarJuego();
      } else {
        this.tiempoRestante.update((t) => t - 1);
      }
    }, 1000);
  }

  private detenerTemporizador(): void {
    if (this.intervaloTemporizador) {
      clearInterval(this.intervaloTemporizador);
      this.intervaloTemporizador = null;
    }
  }

  terminarJuego(): void {
    this.detenerTemporizador();
    this.tableroBloqueado = true;
    this.juegoGanado.set(false);
    this.juegoTerminado.set(true);
  }

  private actualizarCarta(instanceId: string, cambios: Partial<CartaMemory>): void {
    this.cartas.update((cartas) =>
      cartas.map((c) =>
        c.instanceId === instanceId ? { ...c, ...cambios } : c
      )
    );
  }

  private mezclarCartas(cartas: CartaMemory[]): CartaMemory[] {
    const arr = [...cartas];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private seleccionarPokemonesAleatorios(pokemones: Pokemon[], cantidad: number): Pokemon[] {
    const unicos = new Map<number, Pokemon>();

    pokemones.forEach((pokemon) => {
      if (!unicos.has(pokemon.id)) {
        unicos.set(pokemon.id, pokemon);
      }
    });

    return this.mezclarLista([...unicos.values()]).slice(0, cantidad);
  }

  private mezclarLista<T>(lista: T[]): T[] {
    const arr = [...lista];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private calcularPuntos(): number {
    return Math.max(10, Math.floor(this.tiempoRestante() / 2));
  }

  private reproducirSonido(tipo: 'correcto' | 'incorrecto'): void {
    const audio = new Audio(`music/${tipo}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }
}
