import {Component, inject, signal, Signal, WritableSignal} from '@angular/core';
import {NgForOf} from "@angular/common";
import {Drink, DrinkService} from '../../services/drink.service';
import {ModalType} from '../../services/modal.service';
import {UniversalModalService} from '../../shared/modal/universal-modal.service';
import {MODAL_DATA, MODAL_ID} from '../../shared/modal/modal.tokens';
import {ErrorHandlingComponent} from '../../services/error-handling';

@Component({
  selector: 'app-order-drink-modal',
  imports: [
    NgForOf
  ],
  templateUrl: './order-drink-modal.component.html',
  standalone: true,
  styleUrl: './order-drink-modal.component.css'
})
export class OrderDrinkModalComponent extends ErrorHandlingComponent {
  private readonly drinkService = inject(DrinkService);
  private readonly modal = inject(UniversalModalService);
  private readonly modalId: string = inject(MODAL_ID);
  selectedDrink: Drink | null = inject(MODAL_DATA);

  closeModal() {
    this.clearGlobalError();
    this.modal.close(this.modalId);
  }

  async submitOrder() {
    this.clearGlobalError();
    try {
      if (this.selectedDrink) {
        await this.drinkService.orderDrink(this.selectedDrink!.id);
        this.closeModal();
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  setFieldError(_t: string, _m: string): void {}

  clearFieldError(): void {}
}
