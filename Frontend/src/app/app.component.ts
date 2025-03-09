import {Component, inject, Signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {ModalServiceService} from './modal-service.service';
import {OrderCustomDrinkModalComponent} from './order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from './order-drink-modal/order-drink-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, OrderCustomDrinkModalComponent, OrderDrinkModalComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly modalService = inject(ModalServiceService);

  title = 'Frontend';
  menuOpen = false;
  displayedModal: Signal<"ODC" | "OD" | null> = this.modalService.getDisplayedModal();

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


}
