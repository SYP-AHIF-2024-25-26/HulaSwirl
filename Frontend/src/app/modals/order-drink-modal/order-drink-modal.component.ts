import {Component, inject, Signal} from '@angular/core';
import {NgForOf} from "@angular/common";
import {Drink, DrinkService} from '../../services/drink.service';
import {ModalService, ModalType} from '../../services/modal.service';
import {StatusService} from '../../services/status.service';

@Component({
  selector: 'app-order-drink-modal',
  imports: [
    NgForOf
  ],
  templateUrl: './order-drink-modal.component.html',
  standalone: true,
  styleUrl: './order-drink-modal.component.css'
})
export class OrderDrinkModalComponent {
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalService);
  private readonly errorService = inject(StatusService);
  selectedDrink: Signal<Drink | null> = this.modalService.getModalData();

  closeModal() {
    this.modalService.closeModal();
  }

  async submitOrder() {
    try {
      if (this.selectedDrink()) {
        await this.drinkService.orderDrink(this.selectedDrink()!.id);
        this.closeModal();
        this.modalService.openModal(ModalType.E, {message: "Successfully ordered drink!\nGo to the bar to confirm your order."});
      }
    } catch (e) {
      this.errorService.handleError(e);
    }
  }
}
