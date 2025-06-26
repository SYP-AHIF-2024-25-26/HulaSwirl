import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {NgForOf, NgIf, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {UserService, AccountInfo} from '../services/user.service';
import {ErrorHandlingComponent} from '../services/error-handling';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [NgForOf, NgIf, FormsModule, DatePipe],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent extends ErrorHandlingComponent {
  private readonly userService = inject(UserService);
  users: WritableSignal<AccountInfo[]> = signal([]);

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
    return this.userService.getSystemStatus() ? ['user', 'operator', 'admin'] : ['user', 'operator'];
  }

  async changeRole(username: string, role: string) {
    try {
      await this.userService.updateRole(username, role);
      await this.loadUsers();
    } catch (e) {
      this.handleError(e);
    }
  }

  async deleteUser(username: string) {
    try {
      await this.userService.deleteUser(username);
      this.users.update(u => u.filter(us => us.username !== username));
    } catch (e) {
      this.handleError(e);
    }
  }

  setFieldError(_t: string, _m: string): void {}
  clearFieldError(_f?: string): void {}
}
