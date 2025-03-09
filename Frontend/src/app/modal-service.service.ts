import {effect, EventEmitter, Injectable, Output, signal, WritableSignal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalServiceService {

  constructor() {
    effect(() => {
      document.body.style.overflow = this.displayedModal() !== null ? 'hidden' : '';
    });
  }

  private displayedModal: WritableSignal<null | "ODC" | "OD"> = signal(null);
  private modalData: WritableSignal<any> = signal(null);

  closeModal() {
    this.displayedModal.set(null);
  }

  openModal(modal: "ODC" | "OD", data: any = null) {
    this.displayedModal.set(modal);
    this.modalData.set(data);
  }

  getDisplayedModal() {
    return this.displayedModal;
  }

  getModalData() {
    return this.modalData;
  }
}
