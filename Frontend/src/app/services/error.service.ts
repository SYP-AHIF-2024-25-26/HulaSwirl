import { Injectable } from '@angular/core';
import {ModalService, ModalType} from './modal.service';

@Injectable({
  providedIn: 'root'
})

export class ErrorService {
  constructor(private modalService: ModalService) {}

  showError(message: string) {
    this.modalService.openModal(ModalType.E, { message:message });
  }
}
