import {Component, inject, Signal} from '@angular/core';
import {Router, NavigationStart, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf, NgClass} from '@angular/common';
import {ModalService, ModalType} from './services/modal.service';
import {OrderCustomDrinkModalComponent} from './modals/order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from './modals/order-drink-modal/order-drink-modal.component';
import {DrinkModalComponent} from './modals/drink-modal/drink-modal.component';
import {BackgroundLeavesComponent} from './background-leaves/background-leaves.component';
import {IngredientsService} from './services/ingredients.service';
import {DrinkService} from './services/drink.service';
import {UserModalComponent} from './modals/user-modal/user-modal.component';
import {UserService} from './services/user.service';
import {StatusModalComponent} from './modals/status-modal/status-modal.component';
import {GenericModalComponent} from './modals/generic-modal/generic-modal.component';
import {LoadingSpinnerComponent} from './loading-spinner/loading-spinner.component';
import {LoadingService} from './services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, OrderCustomDrinkModalComponent, OrderDrinkModalComponent, DrinkModalComponent, BackgroundLeavesComponent, RouterLinkActive, UserModalComponent, NgIf, NgClass, StatusModalComponent, LoadingSpinnerComponent, GenericModalComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly modalService = inject(ModalService);
  private readonly ingredientService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  private readonly router = inject(Router);
  protected readonly userService = inject(UserService);

  title = 'Frontend';
  displayedModal: Signal<ModalType | null> = this.modalService.getDisplayedModal();
  modalStack = this.modalService.getModalStack();
  menuOpen = false;

  async ngOnInit() {
    await this.ingredientService.loadIngredients();
    await this.drinkService.loadDrinks();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.modalService.closeAll();
      }
    });
  }

  openLoginModal(){
    this.modalService.openModal(ModalType.User,null)
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  protected readonly ModalType = ModalType;
}
