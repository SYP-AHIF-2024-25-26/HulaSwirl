import {Component, inject, Signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {ModalService, ModalType} from './modal.service';
import {OrderCustomDrinkModalComponent} from './order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from './order-drink-modal/order-drink-modal.component';
import {AddDrinkModalComponent}  from './add-drink-modal/add-drink-modal.component';
import {EditDrinkModalComponent}  from './edit-drink-modal/edit-drink-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, OrderCustomDrinkModalComponent, OrderDrinkModalComponent,AddDrinkModalComponent, EditDrinkModalComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly modalService = inject(ModalService);

  title = 'Frontend';
  menuOpen = false;
  displayedModal: Signal<ModalType | null> = this.modalService.getDisplayedModal();

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


  protected readonly ModalType = ModalType;
}
