import {Component, inject, Signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf} from '@angular/common';
import {ModalService, ModalType} from './services/modal.service';
import {OrderCustomDrinkModalComponent} from './modals/order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from './modals/order-drink-modal/order-drink-modal.component';
import {AddDrinkModalComponent} from './modals/add-drink-modal/add-drink-modal.component';
import {EditDrinkModalComponent} from './modals/edit-drink-modal/edit-drink-modal.component';
import {BackgroundLeavesComponent} from './background-leaves/background-leaves.component';
import {IngredientsService} from './services/ingredients.service';
import {DrinkService} from './services/drink.service';
import {StatusModalComponent} from './modals/status-modal/status-modal.component';
import {UserModalComponent} from './modals/user-modal/user-modal.component';
import {UserService} from './services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, OrderCustomDrinkModalComponent, OrderDrinkModalComponent, AddDrinkModalComponent, EditDrinkModalComponent, BackgroundLeavesComponent, RouterLinkActive, StatusModalComponent, UserModalComponent, NgIf],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly modalService = inject(ModalService);
  private readonly ingredientService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  protected readonly userService = inject(UserService);

  title = 'Frontend';
  displayedModal: Signal<ModalType | null> = this.modalService.getDisplayedModal();

  async ngOnInit() {
    await this.ingredientService.loadIngredients();
    await this.drinkService.loadDrinks();
  }

  openLoginModal(){
    this.modalService.openModal(ModalType.U,null)
  }

  protected readonly ModalType = ModalType;
}
