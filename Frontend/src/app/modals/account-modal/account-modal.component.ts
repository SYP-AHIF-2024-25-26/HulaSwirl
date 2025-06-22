// src/app/modals/account-modal/account-modal.component.ts
import {Component, effect, inject, signal, WritableSignal} from '@angular/core';
import {DatePipe, NgIf} from '@angular/common';
import {Router} from '@angular/router';
import {ModalService} from '../../services/modal.service';
import {AccountInfo, UserService} from '../../services/user.service';
import {GenericModalComponent} from '../generic-modal/generic-modal.component';

@Component({
  selector: 'app-account-modal',
  standalone: true,
  imports: [
    GenericModalComponent,
    DatePipe
  ],
  templateUrl: './account-modal.component.html',
  styleUrl: './account-modal.component.css'
})
export class AccountModalComponent {
  protected readonly userService = inject(UserService);
  private readonly modalService = inject(ModalService);
  private readonly router = inject(Router);

  protected userInfo: WritableSignal<null | AccountInfo> = signal(null);

  constructor() {
    effect(async () => {
      const name = this.userService.username();
      if (name) {
        this.userInfo.set(await this.userService.getUserInfo());
      } else {
        this.userInfo.set(null);
      }
    });
  }

  close(): void {
    this.modalService.closeModal();
  }

  logout(): void {
    this.userService.logout().then(() => {
      this.close()
      this.router.navigate(['/']);
    });
  }
}
