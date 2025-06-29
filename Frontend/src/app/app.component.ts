import {
  Component,
  inject,
  Signal,
  HostListener,
  ViewChild,
  ElementRef,
  effect,
  signal,
  WritableSignal
} from '@angular/core';
import {Router, NavigationStart, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf, NgClass} from '@angular/common';
import {ModalService, ModalType} from './services/modal.service';
import {OrderCustomDrinkModalComponent} from './modals/order-custom-drink-modal/order-custom-drink-modal.component';
import {OrderDrinkModalComponent} from './modals/order-drink-modal/order-drink-modal.component';
import {DrinkModalComponent} from './modals/drink-modal/drink-modal.component';
import {IngredientsService} from './services/ingredients.service';
import {DrinkService} from './services/drink.service';
import {UserModalComponent} from './modals/user-modal/user-modal.component';
import {UserService} from './services/user.service';
import {StatusModalComponent} from './modals/status-modal/status-modal.component';
import {LoadingSpinnerComponent} from './loading-spinner/loading-spinner.component';
import {BackgroundLeavesComponent} from './background-leaves/background-leaves.component';
import {AccountModalComponent} from './modals/account-modal/account-modal.component';
import {FpsService} from './services/fps.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    OrderCustomDrinkModalComponent,
    OrderDrinkModalComponent,
    DrinkModalComponent,
    RouterLinkActive,
    UserModalComponent,
    NgIf,
    NgClass,
    StatusModalComponent,
    LoadingSpinnerComponent,
    BackgroundLeavesComponent,
    AccountModalComponent
  ],
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
  displayedModal: Signal<ModalType | null> = this.modalService.getDisplayedModal();
  menuOpen = false;
  accountMenuOpen = false;
  isAtHomeScreen = signal(false);

  protected userInitials = signal("");

  @ViewChild('navbar') navbar!: ElementRef;

  constructor() {
    this.isAtHome();
    effect(() => {
      const user = this.userService.username();
      if (user) {
        this.userInitials.set(user.split(" ").slice(0, 2).map(sub => sub.charAt(0).toUpperCase()).join(""));
      } else {
        this.userInitials.set("");
      }
    });
  }

  async ngOnInit() {
    await this.ingredientService.loadIngredients();
    await this.drinkService.loadDrinks();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.modalService.closeAll();
        this.closeMenus();
      }
    });
    this.isAtHome();
  }

  openLoginModal(){
    this.modalService.openModal(ModalType.User,null)
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (!this.menuOpen) {

      this.accountMenuOpen = false;
    }
  }

  async openAccountModal() {
    try {
      this.modalService.openModal(ModalType.Account, await this.userService.getUserInfo());
    } catch (error) {
      await this.userService.logout();
    }
  }

  closeMenus(){
    this.menuOpen = false;
    this.accountMenuOpen = false;
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: HTMLElement) {
    if (this.menuOpen && this.navbar && !this.navbar.nativeElement.contains(target)) {
      this.closeMenus();
    }
    this.isAtHome();
  }

  private isAtHome() {
    return this.isAtHomeScreen.set(this.router.url === '/' || this.router.url === '/home');
  }

  protected readonly ModalType = ModalType;
}
