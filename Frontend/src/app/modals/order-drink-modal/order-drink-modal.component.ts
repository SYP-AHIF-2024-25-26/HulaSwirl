import {Component, inject, signal, Signal, WritableSignal} from '@angular/core';
import {NgForOf} from "@angular/common";
import {Drink, DrinkService} from '../../services/drink.service';
import {ModalService, ModalType} from '../../services/modal.service';
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
  private readonly modalService = inject(ModalService);
  selectedDrink: Signal<Drink | null> = this.modalService.getModalData();
  

  closeModal() {
    this.modalService.closeModal();
  }

  async submitOrder() {
    this.globalErrors.set([]);
    try {
      if (this.selectedDrink()) {
        await this.drinkService.orderDrink(this.selectedDrink()!.id);
        this.closeModal();
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  setFieldError(_t: string, _m: string): void {}

  clearFieldError(): void {}
}
