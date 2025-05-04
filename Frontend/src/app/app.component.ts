import {Component, inject, Signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {ModalService, ModalType} from './services/modal.service';
import {OrderCustomDrinkModalComponent} from './modals/order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from './modals/order-drink-modal/order-drink-modal.component';
import {AddDrinkModalComponent}  from './modals/add-drink-modal/add-drink-modal.component';
import {EditDrinkModalComponent}  from './modals/edit-drink-modal/edit-drink-modal.component';
import {BackgroundLeavesComponent} from './background-leaves/background-leaves.component';
import {IngredientsService} from './services/ingredients.service';
import {DrinkService} from './services/drink.service';
import {ErrorModalComponent} from './modals/error-modal/error-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, OrderCustomDrinkModalComponent, OrderDrinkModalComponent, AddDrinkModalComponent, EditDrinkModalComponent, BackgroundLeavesComponent, RouterLinkActive, ErrorModalComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly modalService = inject(ModalService);
  private readonly ingredientService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);

  title = 'Frontend';
  displayedModal: Signal<ModalType | null> = this.modalService.getDisplayedModal();

  async ngOnInit() {
    await this.ingredientService.reloadIngredients();
    await this.drinkService.reloadDrinks();
  }

  protected readonly ModalType = ModalType;
}
