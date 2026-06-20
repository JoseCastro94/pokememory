import { Component, input, output } from '@angular/core';
import { CartaMemory } from '../../core/model/carta-memory.model';

@Component({
  selector: 'app-carta-memory',
  standalone: true,
  templateUrl: './carta-memory.html',
  styleUrl: './carta-memory.css',
})
export class CartaMemoryComponent {
  carta = input.required<CartaMemory>();
  cartaSeleccionada = output<CartaMemory>();

  seleccionar(): void {
    if (!this.carta().volteada && !this.carta().encontrada) {
      this.cartaSeleccionada.emit(this.carta());
    }
  }
}
