import { CommonModule, DatePipe } from '@angular/common';
import {Component, computed, effect, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ModalService} from '../../services/modal.service';
import {AccountInfo, AccountModalData, UserService} from '../../services/user.service';
import {GenericModalComponent} from '../generic-modal/generic-modal.component';
import {IncomingOrder, OrdersService} from '../../services/orders.service';
import {ErrorService} from '../../services/error.service';
import {Drink, DrinkService} from '../../services/drink.service';
import {ModalType} from '../../services/modal.service';

@Component({
  selector: 'app-account-modal',
  standalone: true,
  imports: [
    GenericModalComponent,
    DatePipe,
    FormsModule,
    CommonModule
],
  templateUrl: './account-modal.component.html',
  styleUrl: './account-modal.component.css'
})
export class AccountModalComponent {
  protected readonly userService = inject(UserService);
  private readonly modalService = inject(ModalService);
  private readonly ordersService = inject(OrdersService);
  private readonly errorService = inject(ErrorService);
  private readonly drinkService = inject(DrinkService);

  protected modalData = signal<AccountModalData | null>(null);
  protected activeTab = signal<'info' | 'orders'>('info');
  protected confirmationOpen = signal(false);
  protected deleteConfirmationText = signal('');
  protected newKey = signal('');
  protected roleUpdating = signal(false);
  protected feedback = signal('');
  protected error = signal('');
  protected savingKey = signal(false);

  protected userInfo = computed<AccountInfo | null>(() => this.modalData()?.user ?? null);
  protected isAdminView = computed(() => this.modalData()?.context === 'admin');
  protected isSelf = computed(() => {
    const current = this.userService.username()?.toLowerCase();
    const target = this.userInfo()?.username.toLowerCase();
    return !!current && !!target && current === target;
  });

  protected updateConfirmation(){
    this.confirmationOpen.update(v => !v);
    this.deleteConfirmationText.set('');
  }

  protected isAdmin = computed(() => {
    const info = this.userInfo();
    if (!info) return false;
    if (!this.isAdminView()) return false;
    return info.role === 'system' || info.role === 'admin';
  });

  protected canDelete = computed(() => {
    return this.isSelf() || this.isAdmin();
  });

  protected canConfirmDelete = computed(() => this.deleteConfirmationText().trim().toUpperCase() === 'DELETE');

  protected canLogout = computed(() => !this.isAdminView());

  protected orderHistory = computed<IncomingOrder[]>(() => {
    const username = this.userInfo()?.username.toLowerCase();
    if (!username) return [];
    return [...this.ordersService.allOrders().filter(o => o.user.toLowerCase() === username)]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  });

  protected initials = computed(() => {
    const user = this.userInfo()?.username ?? '';
    return user.split(' ').slice(0, 2).map(sub => sub.charAt(0).toUpperCase()).join('');
  });

  constructor() {
    effect(() => {
      const incoming = this.modalService.getModalData()();
      if (incoming) {
        this.modalData.set(incoming as AccountModalData);
        this.feedback.set('');
        this.error.set('');
        this.confirmationOpen.set(false);
        this.deleteConfirmationText.set('');
        this.activeTab.set('info');
      }
    });
  }

  ngOnInit() {
    this.ordersService.connectWebSocket();
  }

  close(): void {
    this.modalService.closeModal();
  }

  selectTab(tab: 'info' | 'orders') {
    this.activeTab.set(tab);
  }

  statusLabel(order: IncomingOrder) {
    switch (order.status) {
      case 1:
        return 'Accepted';
      case 2:
        return 'Canceled';
      default:
        return 'Pending';
    }
  }

  statusClass(order: IncomingOrder) {
    switch (order.status) {
      case 1:
        return 'status accepted';
      case 2:
        return 'status canceled';
      default:
        return 'status pending';
    }
  }

  getIngredientsFromOrder(order: IncomingOrder): string {
    return order.orderIngredients.map(oi => `${oi.ingredientName} (${oi.amount} ml)`).join(', ');
  }

  async logout() {
    await this.userService.logout();
    this.modalService.closeModal();
  }

  async deleteAccount() {
    const user = this.userInfo();
    if (!user || !this.canDelete()) return;
    if (!this.canConfirmDelete()) {
      this.error.set('Type DELETE to confirm account removal.');
      return;
    }
    try {
      await this.userService.deleteUser(user.username);
      this.feedback.set('Account deleted successfully.');
      const callback = this.modalData()?.onUpdated;
      if (callback) await callback();
      if (this.isSelf()) {
        await this.userService.logout();
      } else {
        this.modalService.closeModal();
      }
    } catch (e) {
      this.errorService.handleError(
        e,
        (_, m) => this.error.set(m),
        m => this.error.set(m)
      );
    }
  }

  async changeRole(ev: Event) {
    const target = ev.target as HTMLSelectElement;
    const role = target.value;
    const user = this.userInfo();
    if (!user || !this.isAdmin()) return;
    if (role === user.role) return;

    this.roleUpdating.set(true);
    this.feedback.set('');
    this.error.set('');
    try {
      await this.userService.updateRole(user.username, role);
      this.modalData.update(d => d ? ({...d, user: {...d.user, role}}) : d);
      const callback = this.modalData()?.onUpdated;
      if (callback) await callback();
      this.feedback.set('Role updated.');
    } catch (e) {
      target.value = user.role;
      this.errorService.handleError(
        e,
        (_, m) => this.error.set(m),
        m => this.error.set(m)
      );
    } finally {
      this.roleUpdating.set(false);
    }
  }

  async resetKey() {
    const user = this.userInfo();
    const key = this.newKey().trim();
    if (!user || !this.isAdmin()) return;
    if (!key) {
      this.error.set('Please enter a new password.');
      return;
    }
    this.savingKey.set(true);
    this.error.set('');
    this.feedback.set('');
    try {
      await this.userService.resetUserKey(user.username, key);
      this.newKey.set('');
      const callback = this.modalData()?.onUpdated;
      if (callback) await callback();
      this.feedback.set('Password has been reset.');
    } catch (e) {
      this.errorService.handleError(
        e,
        (_, m) => this.error.set(m),
        m => this.error.set(m)
      );
    } finally {
      this.savingKey.set(false);
    }
  }

  private normalizeName(name: string): string {
    return (name ?? '').trim().toLowerCase();
  }

  private findMatchingDrink(order: IncomingOrder): Drink | null {
    const orderName = this.normalizeName(order.drinkName);
    if (!orderName) return null;

    const drinks = this.drinkService.drinks();
    const byName = drinks.find(d => this.normalizeName(d.name) === orderName);
    return byName ?? null;
  }

  protected reorder(order: IncomingOrder) {
    // Open the "existing drink" order modal if we can still find the drink.
    const matched = this.findMatchingDrink(order);
    if (matched) {
      this.modalService.openModal(ModalType.Order, matched);
      return;
    }

    // Fallback: open custom order modal prefilled from the order history.
    // No image, and only what was stored on the order.
    this.modalService.openModal(ModalType.CustomOrder, {
      mode: 'reorder',
      drinkName: order.drinkName,
      containsIce: order.containsIce,
      ingredients: order.orderIngredients.map(i => ({
        ingredientName: i.ingredientName,
        amount: i.amount
      }))
    });
  }
}
