import {Component, effect, inject, signal, Signal} from '@angular/core';

import {GenericModalComponent} from '../generic-modal/generic-modal.component';
import {Drink, DrinkService} from '../../services/drink.service';
import {ModalService} from '../../services/modal.service';
import {ErrorHandlingComponent} from '../../services/error-handling';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-order-drink-modal',
  imports: [
    GenericModalComponent,
    FormsModule
],
  templateUrl: './order-drink-modal.component.html',
  standalone: true,
  styleUrl: './order-drink-modal.component.css'
})
export class OrderDrinkModalComponent extends ErrorHandlingComponent {
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalService);
  selectedDrink: Signal<Drink | null> = this.modalService.getModalData();
  containsIce = signal(false);
  totalAmount = signal(0);

  constructor() {
    super();
    effect(() => {
      const drink = this.selectedDrink();
      if (drink && drink.drinkIngredients) {
        const total = drink.drinkIngredients.reduce((sum, ingredient) => sum + (ingredient.amount || 0), 0);
        this.totalAmount.set(total);
      }
    });
  }

  closeModal() {
    this.clearGlobalError();
    this.containsIce.set(false);
    this.modalService.closeModal();
  }

  async submitOrder() {
    this.clearGlobalError();
    try {
      if (this.selectedDrink()) {
        await this.drinkService.orderDrink(this.selectedDrink()!.id, this.containsIce());
        this.closeModal();
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  setFieldError(_t: string, _m: string): void {}

  clearFieldError(): void {}
}
