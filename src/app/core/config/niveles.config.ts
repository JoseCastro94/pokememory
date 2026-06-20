export interface NivelJuego {
  filas: number;
  columnas: number;
  tiempoSegundos: number;
}

export const NIVELES: NivelJuego[] = [
  { filas: 3, columnas: 4, tiempoSegundos: 50 },
  { filas: 4, columnas: 4, tiempoSegundos: 60 },
  { filas: 5, columnas: 4, tiempoSegundos: 70 },
  { filas: 6, columnas: 4, tiempoSegundos: 80 },
  { filas: 7, columnas: 4, tiempoSegundos: 90 },
  { filas: 8, columnas: 4, tiempoSegundos: 100 },
  { filas: 9, columnas: 4, tiempoSegundos: 110 },
  { filas: 10, columnas: 4, tiempoSegundos: 120 },
  { filas: 11, columnas: 4, tiempoSegundos: 130 },
];

export function obtenerNombreNivel(indice: number): string {
  const nombres = ['Facil', 'Normal', 'Dificil', 'Experto', 'Maestro', 'Leyenda', 'Campeon', 'Elite', 'Mitico'];
  return nombres[indice] ?? 'Desconocido';
}
