import {Component, inject, Signal, signal, WritableSignal} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {Drink, DrinkService} from '../drink.service';
import {ModalService} from '../modal.service';

@Component({
  selector: 'app-order-drink-modal',
    imports: [
        NgForOf
    ],
  templateUrl: './order-drink-modal.component.html',
  styleUrl: './order-drink-modal.component.css'
})
export class OrderDrinkModalComponent {
  private readonly drinkService = inject(DrinkService);
  private readonly modalService = inject(ModalService);
  selectedDrink: Signal<Drink | null> = this.modalService.getModalData();

  closeModal() {
    this.modalService.closeModal();
  }

  async submitOrder() {
    if(this.selectedDrink()) {
      await this.drinkService.orderDrink(this.selectedDrink()!);
    }
    this.closeModal();
  }
}
