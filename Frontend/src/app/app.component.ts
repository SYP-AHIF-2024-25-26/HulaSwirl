import {Component, inject, Signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {ModalService, ModalType} from './services/modal.service';
import {OrderCustomDrinkModalComponent} from './modals/order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from './modals/order-drink-modal/order-drink-modal.component';
import {AddDrinkModalComponent}  from './modals/add-drink-modal/add-drink-modal.component';
import {EditDrinkModalComponent}  from './modals/edit-drink-modal/edit-drink-modal.component';
import {BackgroundLeavesComponent} from './background-leaves/background-leaves.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, OrderCustomDrinkModalComponent, OrderDrinkModalComponent, AddDrinkModalComponent, EditDrinkModalComponent, BackgroundLeavesComponent],
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
