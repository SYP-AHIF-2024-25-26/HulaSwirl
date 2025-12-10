import {Component, effect, inject, signal, WritableSignal, computed} from '@angular/core';
import {NgForOf, NgIf, DatePipe} from '@angular/common';
import {UserService, ManagedUser} from '../services/user.service';
import {ErrorHandlingComponent} from '../services/error-handling';
import {ErrorService} from '../services/error.service';
import {ModalService, ModalType} from '../services/modal.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [NgForOf, DatePipe, NgIf, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent extends ErrorHandlingComponent {
  protected readonly userService = inject(UserService);
  private readonly statusService = inject(ErrorService);
  private readonly modalService = inject(ModalService);

  protected users: WritableSignal<ManagedUser[]> = signal([]);

  protected searchTerm = signal<string>('');

  protected filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allUsers = this.users();
    if (!term) {
      return allUsers;
    }
    return allUsers.filter(u =>
      u.username.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  constructor() {
    super();
    effect(async () => {
      await this.loadUsers();
    });
  }

  async loadUsers(): Promise<void> {
    this.users.set(await this.userService.getAllUsers());
  }

  viewProfile(user: ManagedUser): void {
    this.modalService.openModal(ModalType.Account, {
      user,
      context: 'admin',
      onUpdated: async () => await this.loadUsers()
    });
  }

  initials(user: ManagedUser): string {
    return user.username
      .split(' ')
      .slice(0, 2)
      .map(sub => sub.charAt(0).toUpperCase())
      .join('');
  }

  getLastSeenText(lastLogin: unknown): string {
    if (!lastLogin) {
      return 'Never';
    }

    const last = new Date(lastLogin as string | number | Date);
    if (Number.isNaN(last.getTime())) {
      return 'Never';
    }

    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return 'Today';
    }
    if (days === 1) {
      return '1 day ago';
    }
    return `${days} days ago`;
  }

  override setFieldError(target: string, message: string): void {
    this.users.update(users => {
      const user = users.find(u => u.username === target);
      if (user) {
        user.status = message;
      }
      return users;
    });
  }

  override clearFieldError(field?: string): void {
    this.users.update(users => {
      if (field) {
        const user = users.find(u => u.username === field);
        if (user) {
          user.status = '';
        }
      } else {
        users.forEach(user => (user.status = ''));
      }
      return users;
    });
  }

  override setGlobalError(message: string): void {
    this.statusService.showMessage(message);
  }
}
