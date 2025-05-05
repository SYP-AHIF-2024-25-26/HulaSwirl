import {Component, inject, Signal} from '@angular/core';
import {NgForOf} from "@angular/common";
import {Drink, DrinkService} from '../../services/drink.service';
import {ModalService, ModalType} from '../../services/modal.service';
import {ErrorService} from '../../services/error.service';

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
  private readonly errorService = inject(ErrorService);
  selectedDrink: Signal<Drink | null> = this.modalService.getModalData();

  closeModal() {
    this.modalService.closeModal();
  }

  async submitOrder() {
    var res = 0;
    if(this.selectedDrink()) {
      res= await this.drinkService.orderDrink(this.selectedDrink()!.id);
    }
    this.closeModal();
    this.modalService.closeModal();
    this.errorService.startProgress(res);
  }
}
