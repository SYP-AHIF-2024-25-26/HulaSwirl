// user-modal.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ModalService, ModalType } from '../../services/modal.service';
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

  mode = signal<'login' | 'register'>('login');

  // login
  loginEmail = signal('');
  loginPassword = signal('');

  // register
  regUsername = signal('');
  regEmail = signal('');
  regPassword = signal('');

  /** Login mit UserService */
  async login() {
    await this.userService.login(this.loginEmail(), this.loginPassword());
    if (this.userService.isLoggedIn()) {
      this.closeModal();
    }
  }

  /** Registrierung */
  async register() {
    await this.userService.register(
      this.regUsername(),
      this.regEmail(),
      this.regPassword()
    );
    if (this.userService.isLoggedIn()) {
      this.closeModal();
    }
  }

  switchMode(to: 'login' | 'register') {
    this.mode.set(to);
  }

  closeModal() {
    this.modalService.closeModal();
  }
}
