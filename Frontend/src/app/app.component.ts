import {Component, inject, Signal} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NgClass, NgOptimizedImage} from '@angular/common';
import {ModalServiceService} from './modal-service.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly modalService = inject(ModalServiceService);

  title = 'Frontend';
  menuOpen = false;
  displayedModal: Signal<"ODC" | "OD" | null> = this.modalService.getDisplayedModal();

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


}
