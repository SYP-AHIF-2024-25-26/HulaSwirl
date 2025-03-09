import {Component, inject} from '@angular/core';
import {ModalService} from '../modal.service';

@Component({
  selector: 'app-add-drink-modal',
  imports: [],
  templateUrl: './add-drink-modal.component.html',
  styleUrl: './add-drink-modal.component.css'
})
export class AddDrinkModalComponent {
  private readonly modalService = inject(ModalService);

  closeModal() {
    this.modalService.closeModal();
  }
}
