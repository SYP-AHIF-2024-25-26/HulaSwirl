// user-modal.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../services/modal.service';
import { ErrorService } from '../../services/error.service';

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
export class UserModalComponent {
  private readonly userService = inject(UserService);
  private readonly modalService = inject(ModalService);
  private readonly errorService = inject(ErrorService);

  fieldErrors = signal<Record<string, string>>({});
  globalErrors = signal<string[]>([]);

  mode = signal<'login' | 'register'>('login');

  // login
  loginUsername = signal('');
  loginKey = signal('');

  // register
  regUsername = signal('');
  regKey = signal('');

  async login() {
    this.fieldErrors.set({});
    this.globalErrors.set([]);
    try {
      await this.userService.login(this.loginUsername(), this.loginKey());
      if (this.userService.isLoggedIn()) {
        this.closeModal();
      }
    } catch (e) {
      this.errorService.handleError(
        e,
        (t, m) => this.fieldErrors.set({ ...this.fieldErrors(), [t]: m }),
        m => this.globalErrors.set([...this.globalErrors(), m])
      );
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
      this.errorService.handleError(
        e,
        (t, m) => this.fieldErrors.set({ ...this.fieldErrors(), [t]: m }),
        m => this.globalErrors.set([...this.globalErrors(), m])
      );
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
