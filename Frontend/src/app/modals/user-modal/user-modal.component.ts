// user-modal.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../services/modal.service';
import { ErrorHandlingComponent } from '../../services/error-handling';

/**
 * Modal für Login & Registrierung.
 * Zeigt zwei Tabs (login | register). Speichert JWT via UserService.
 */
@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-modal.component.html',
  styleUrls: ['./user-modal.component.css']
})
export class UserModalComponent extends ErrorHandlingComponent {
  private readonly userService = inject(UserService);
  private readonly modalService = inject(ModalService);

  fieldErrors = signal<Record<string, string>>({});

  mode = signal<'login' | 'register'>('login');

  // login
  loginUsername = signal('');
  loginKey = signal('');

  // register
  regUsername = signal('');
  regKey = signal('');

  constructor() {
    super();
  }

  async login() {
    this.fieldErrors.set({});
    this.globalErrors.set([]);
    try {
      await this.userService.login(this.loginUsername(), this.loginKey());
      if (this.userService.isLoggedIn()) {
        this.closeModal();
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  async register() {
    this.fieldErrors.set({});
    this.globalErrors.set([]);
    try {
      await this.userService.register(
        this.regUsername(),
        this.regKey()
      );
      if (this.userService.isLoggedIn()) {
        this.closeModal();
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  setFieldError(field: string, message: string) {
    this.fieldErrors.set({ ...this.fieldErrors(), [field]: message });
  }

  clearFieldError(field: string = '') {
    if (field) {
      const { [field]: _, ...rest } = this.fieldErrors();
      this.fieldErrors.set(rest);
    } else {
      this.fieldErrors.set({});
    }
  }

  switchMode(to: 'login' | 'register') {
    this.mode.set(to);
    this.fieldErrors.set({});
    this.globalErrors.set([]);
  }

  closeModal() {
    this.fieldErrors.set({});
    this.globalErrors.set([]);
    this.modalService.closeModal();
  }

  async onSubmit() {
    if (this.mode() === 'login') {
      await this.login();
    } else {
      await this.register();
    }
  }
}
