import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {NgForOf, NgIf, DatePipe} from '@angular/common';
import {UserService, ManagedUser} from '../services/user.service';
import {ErrorHandlingComponent} from '../services/error-handling';
import {ErrorService} from '../services/error.service';
import {ModalService, ModalType} from '../services/modal.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [NgForOf, DatePipe, NgIf],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent extends ErrorHandlingComponent {
  protected readonly userService = inject(UserService);
  private readonly modalService = inject(ModalService);
  private readonly statusService = inject(ErrorService);
  protected users: WritableSignal<ManagedUser[]> = signal([]);

  constructor() {
    super();
    effect(async () => {
      await this.loadUsers();
    });
  }

  async loadUsers() {
    try {
      this.users.set(await this.userService.getAllUsers());
    } catch (e) {
      this.handleError(e);
    }
  }

  openProfile(user: ManagedUser) {
    this.modalService.openModal(ModalType.Account, {
      profile: user,
      origin: 'admin',
      refreshUsers: () => this.loadUsers()
    });
  }

  initials(username: string) {
    return username.split(" ").slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');
  }

  override setFieldError(target: string, message: string) {
    this.users.update(users => {
      const user = users.find(u => u.username === target);
      if (user) {
        user.status = message;
      }
      return users;
    });
  }

  override clearFieldError(field?: string) {
    this.users.update(users => {
      if (field) {
        const user = users.find(u => u.username === field);
        if (user) {
          user.status = '';
        }
      } else {
        users.forEach(user => user.status = '');
      }
      return users;
    });
  }

  override setGlobalError(message: string) {
    this.statusService.showMessage(message);
  }
}
