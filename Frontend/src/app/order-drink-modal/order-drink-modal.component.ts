import {Component, inject, Signal, signal, WritableSignal} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {Drink} from '../drink.service';
import {ModalServiceService} from '../modal-service.service';

@Component({
  selector: 'app-order-drink-modal',
    imports: [
        NgForOf,
        NgIf
    ],
  templateUrl: './order-drink-modal.component.html',
  styleUrl: './order-drink-modal.component.css'
})
export class OrderDrinkModalComponent {
  private readonly modalService = inject(ModalServiceService);
  selectedDrink: Signal<Drink | null> = this.modalService.getModalData();

  closeModal() {
    this.modalService.closeModal();
  }
}
