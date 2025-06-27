import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {NgForOf, NgIf, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserService, AccountInfo, ManagedUser} from '../services/user.service';
import {ErrorHandlingComponent} from '../services/error-handling';
import {ErrorService} from '../services/error.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [NgForOf, FormsModule, DatePipe, NgIf],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent extends ErrorHandlingComponent {
  private readonly userService = inject(UserService);
  private readonly statusService = inject(ErrorService);
  users: WritableSignal<ManagedUser[]> = signal([]);

  constructor() {
    super();
    effect(async () => {
      await this.loadUsers();
    });
  }

  async loadUsers() {
    this.users.set(await this.userService.getAllUsers());
  }

  allowedRoles(): string[] {
    return this.userService.getRole() === 'system'
      ? ['User', 'Operator', 'Admin']
      : ['User', 'Operator'];
  }

  async changeRole(user: ManagedUser, ev: Event) {
    const target = ev.target as HTMLSelectElement;
    try {
      await this.userService.updateRole(user.username, target.value);
      await this.loadUsers();
    } catch (e) {
      target.value = this.getUserRole(user)
      this.handleError(e);
    }
  }

  getUserRole(user: ManagedUser): string {
    return user.role[0].toUpperCase() + user.role.slice(1)
  }

  async deleteUser(username: string) {
    try {
      await this.userService.deleteUser(username);
      this.users.update(u => u.filter(us => us.username !== username));
    } catch (e) {
      this.handleError(e);
    }
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
