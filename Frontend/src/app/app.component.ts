import {Component, inject, Signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf, NgClass} from '@angular/common';
import {UniversalModalService} from './shared/modal/universal-modal.service';
import {OrderCustomDrinkModalComponent} from './modals/order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from './modals/order-drink-modal/order-drink-modal.component';
import {DrinkModalComponent} from './modals/drink-modal/drink-modal.component';
import {BackgroundLeavesComponent} from './background-leaves/background-leaves.component';
import {IngredientsService} from './services/ingredients.service';
import {DrinkService} from './services/drink.service';
import {UserModalComponent} from './modals/user-modal/user-modal.component';
import {UserService} from './services/user.service';
import {StatusModalComponent} from './modals/status-modal/status-modal.component';
import {LoadingSpinnerComponent} from './loading-spinner/loading-spinner.component';
import {LoadingService} from './services/loading.service';
import {ModalHostComponent} from './shared/modal/modal-host.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BackgroundLeavesComponent,
    NgIf,
    NgClass,
    LoadingSpinnerComponent,
    ModalHostComponent
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly universalModal = inject(UniversalModalService);
  private readonly ingredientService = inject(IngredientsService);
  private readonly drinkService = inject(DrinkService);
  protected readonly userService = inject(UserService);

  title = 'Frontend';
  menuOpen = false;

  async ngOnInit() {
    await this.ingredientService.loadIngredients();
    await this.drinkService.loadDrinks();
  }

  openLoginModal(){
    this.universalModal.open({ body: UserModalComponent, rawBody: true });
  }

  openExampleModal(){
    this.universalModal.open({
      title: 'Universal Modal',
      body: 'This modal was opened via ModalService',
      buttons: [{ label: 'Close' }]
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
