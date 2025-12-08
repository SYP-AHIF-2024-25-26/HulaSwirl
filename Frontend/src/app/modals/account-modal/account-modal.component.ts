// src/app/modals/account-modal/account-modal.component.ts
import {Component, computed, effect, inject, signal, WritableSignal} from '@angular/core';
import {DatePipe, NgClass, NgForOf, NgIf, TitleCasePipe} from '@angular/common';
import {ModalService} from '../../services/modal.service';
import {AccountInfo, UserService} from '../../services/user.service';
import {GenericModalComponent} from '../generic-modal/generic-modal.component';
import {ErrorHandlingComponent} from '../../services/error-handling';
import {IncomingOrder, OrderIngredient, OrdersService} from '../../services/orders.service';

type ProfilePayload = AccountInfo | { profile: AccountInfo; origin?: 'self' | 'admin'; refreshUsers?: () => Promise<void> | void };

@Component({
  selector: 'app-account-modal',
  standalone: true,
  imports: [
    GenericModalComponent,
    DatePipe,
    NgIf,
    NgForOf,
    NgClass,
    TitleCasePipe
  ],
  templateUrl: './account-modal.component.html',
  styleUrl: './account-modal.component.css'
})
export class AccountModalComponent extends ErrorHandlingComponent {
  protected readonly userService = inject(UserService);
  private readonly modalService = inject(ModalService);
  private readonly ordersService = inject(OrdersService);

  protected profile: WritableSignal<null | AccountInfo> = signal(null);
  protected badge = signal<string>('user');
  protected context = signal<'self' | 'admin'>('self');
  protected activeTab = signal<'info' | 'orders'>('info');
  protected confirmingDelete = signal(false);
  protected statusMessage = signal('');
  protected generatedKey = signal('');
  protected loadingAction = signal(false);
  protected fieldErrors: WritableSignal<Record<string, string>> = signal({});
  private readonly refresher = signal<(() => Promise<void> | void) | null>(null);

  protected profileError = computed(() => {
    const user = this.profile();
    if (!user) return '';
    return this.fieldErrors()[user.username] ?? '';
  });

  protected isSelf = computed(() => {
    const current = this.userService.username()?.toLowerCase() ?? '';
    const profileUser = this.profile()?.username?.toLowerCase() ?? '';
    return !!profileUser && profileUser === current;
  });

  protected canManageRoles = computed(() => {
    const profile = this.profile();
    if (!profile) return false;
    if (this.isSelf()) return false;
    if (this.context() !== 'admin') return false;
    if (!this.userService.hasRole('admin')) return false;
    if (profile.role === 'system') return false;
    if (profile.role === 'admin' && !this.userService.hasRole('system')) return false;
    return true;
  });

  protected canResetPassword = computed(() => {
    const profile = this.profile();
    if (!profile) return false;
    if (this.context() !== 'admin') return false;
    if (!this.userService.hasRole('admin')) return false;
    if (profile.role === 'system') return false;
    if (profile.role === 'admin' && !this.userService.hasRole('system')) return false;
    return true;
  });

  protected canDelete = computed(() => {
    const profile = this.profile();
    if (!profile) return false;
    if (profile.role === 'system') return false;
    if (this.isSelf()) return true;
    if (!this.userService.hasRole('admin')) return false;
    if (profile.role === 'admin' && !this.userService.hasRole('system')) return false;
    return true;
  });

  protected orderHistory = computed(() => {
    const username = this.profile()?.username?.toLowerCase();
    if (!username) return [] as IncomingOrder[];
    return [...this.ordersService.allOrders().filter(order => order.user.toLowerCase() === username)]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  });

  constructor() {
    super();
    effect(() => {
      const data = this.modalService.getModalData()();
      if (data) {
        this.ordersService.connectWebSocket();
        this.loadProfile(data as ProfilePayload);
      }
    });
  }

  private loadProfile(payload: ProfilePayload) {
    this.clearGlobalError();
    this.clearFieldError();
    this.statusMessage.set('');
    this.generatedKey.set('');
    this.confirmingDelete.set(false);
    this.activeTab.set('info');

    const hasProfileWrapper = typeof (payload as { profile?: AccountInfo }).profile !== 'undefined';
    const info = hasProfileWrapper ? (payload as any).profile as AccountInfo : payload as AccountInfo;
    const origin = hasProfileWrapper ? (payload as any).origin ?? 'admin' : 'self';
    const refresh = hasProfileWrapper ? (payload as any).refreshUsers ?? null : null;

    this.profile.set(info as AccountInfo);
    this.badge.set(info.role ?? 'user');
    this.context.set(origin === 'admin' ? 'admin' : 'self');
    this.refresher.set(refresh);
  }

  profileInitials() {
    const name = this.profile()?.username ?? '';
    return name.split(' ').slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');
  }

  switchTab(tab: 'info' | 'orders') {
    this.activeTab.set(tab);
  }

  async updateRole(role: string) {
    const user = this.profile();
    if (!user || user.role === role) return;
    this.clearGlobalError();
    this.clearFieldError();
    this.loadingAction.set(true);
    try {
      await this.userService.updateRole(user.username, role);
      this.profile.set({ ...user, role });
      this.badge.set(role);
      this.statusMessage.set('Role updated successfully.');
      await this.triggerRefresh();
    } catch (e) {
      this.handleError(e);
    } finally {
      this.loadingAction.set(false);
    }
  }

  async resetPassword() {
    const user = this.profile();
    if (!user) return;
    this.clearGlobalError();
    this.clearFieldError();
    this.loadingAction.set(true);
    try {
      const res = await this.userService.resetPassword(user.username);
      this.generatedKey.set(res.newKey);
      this.statusMessage.set('A new password has been generated.');
    } catch (e) {
      this.handleError(e);
    } finally {
      this.loadingAction.set(false);
    }
  }

  startDelete() {
    this.confirmingDelete.set(true);
    this.statusMessage.set('Please confirm you want to remove this account.');
  }

  async deleteProfile() {
    const user = this.profile();
    if (!user) return;
    this.clearGlobalError();
    this.clearFieldError();
    this.loadingAction.set(true);
    try {
      await this.userService.deleteUser(user.username);
      await this.triggerRefresh();
      if (this.isSelf()) {
        await this.userService.logout();
      } else {
        this.statusMessage.set('The account has been removed.');
        this.modalService.closeModal();
      }
    } catch (e) {
      this.handleError(e);
    } finally {
      this.loadingAction.set(false);
    }
  }

  close(): void {
    this.modalService.closeModal();
  }

  async logout() {
    await this.userService.logout();
  }

  formatIngredients(ingredients: OrderIngredient[]) {
    return ingredients.map(i => `${i.amount || 0}ml ${i.ingredientName}`).join(' · ');
  }

  statusClass(status: IncomingOrder['status']) {
    if (status === 1) return 'accepted';
    if (status === 2) return 'canceled';
    return 'pending';
  }

  statusLabel(status: IncomingOrder['status']) {
    if (status === 1) return 'Accepted';
    if (status === 2) return 'Canceled';
    return 'Pending';
  }

  private async triggerRefresh() {
    const refresh = this.refresher();
    if (refresh) {
      await refresh();
    }
  }

  override setFieldError(target: string, message: string) {
    this.fieldErrors.set({ ...this.fieldErrors(), [target]: message });
  }

  override clearFieldError(field?: string) {
    if (field) {
      const { [field]: _, ...rest } = this.fieldErrors();
      this.fieldErrors.set(rest);
    } else {
      this.fieldErrors.set({});
    }
  }
}
