import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/inicio-juego/inicio-juego').then(
        (m) => m.InicioJuegoComponent
      ),
  },
  {
    path: 'juego',
    loadComponent: () =>
      import('./features/tablero-juego/tablero-juego').then(
        (m) => m.TableroJuegoComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
