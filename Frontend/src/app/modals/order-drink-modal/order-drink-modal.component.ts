import {Component, inject, signal, Signal, WritableSignal} from '@angular/core';
import {NgForOf} from "@angular/common";
import {GenericModalComponent} from '../generic-modal/generic-modal.component';
import {Drink, DrinkService} from '../../services/drink.service';
import {ModalService, ModalType} from '../../services/modal.service';
import {ErrorHandlingComponent} from '../../services/error-handling';
import {FormsModule} from '@angular/forms';
import {OrderQueueService} from '../../services/order-queue.service';

@Component({
  selector: 'app-order-drink-modal',
  imports: [
    NgForOf,
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
  private readonly orderQueueService = inject(OrderQueueService);
  selectedDrink: Signal<Drink | null> = this.modalService.getModalData();
  containsIce = signal(false);

  closeModal() {
    this.clearGlobalError();
    this.containsIce.set(false);
    this.modalService.closeModal();
  }

  async submitOrder() {
    this.clearGlobalError();
    try {
      if (this.selectedDrink()) {
        const order = await this.drinkService.orderDrink(this.selectedDrink()!.id, this.containsIce());
        this.orderQueueService.trackOrder(order);
        this.closeModal();
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  setFieldError(_t: string, _m: string): void {}

  clearFieldError(): void {}
}
